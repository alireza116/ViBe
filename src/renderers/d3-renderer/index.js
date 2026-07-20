// @ts-check
import * as d3 from "d3";
import { DEFAULT_EFFECTS } from "../../core/effects.js";
import { markCenter } from "../../edit/shared.js";
import { resolveCurve, STYLE_FIELDS, partitionScene } from "../shared.js";

export class D3Renderer {
  constructor() {
    // The standard paint surface: node field -> [SVG attribute, base default].
    // Every shape draw runs `_applyStyle`, which reads these off the node.
    // The channel list is shared with every other renderer (see STYLE_FIELDS in
    // renderers/shared.js) — ADDING A STYLE CHANNEL IS ONE ROW THERE.
    /** @type {[string, string, any][]} */
    this.STYLE_ATTRS = STYLE_FIELDS.map(({ field, svgAttr, base }) => [
      field,
      svgAttr,
      base,
    ]);
  }

  /** The theme's default text size (fallback for a text node with no fontSize). */
  _themeFontSize() {
    return (this._theme && this._theme.font && this._theme.font.size) || 10;
  }

  /**
   * @param {any} context
   */
  render(context) {
    const {
      container,
      scene,
      width,
      height,
      margins,
      onEvent,
      planeOnTop = false,
      planeCursor = "pointer",
      responsive = "fixed",
      overflow = "hidden",
    } = context;
    const effects = context.effects || DEFAULT_EFFECTS;

    const innerWidth = width - margins.left - margins.right;
    const innerHeight = height - margins.top - margins.bottom;

    const { g, plane } = this._ensureScene(container, {
      width,
      height,
      margins,
      innerWidth,
      innerHeight,
      responsive,
      overflow,
    });

    // Stashed for the text mark's content-edit overlay (_editText), which is
    // spawned from a node's dblclick handler outside this closure.
    this._sceneG = g;
    this._onEvent = onEvent;
    // The chart's resolved theme (stashed for the draw helpers' font-size fallback).
    // When the theme names a font family, emit it on the root svg so every SVG text
    // inherits it; a null family (the default look) leaves the host page's font.
    this._theme = context.theme || null;
    const themeFont = this._theme && this._theme.font;
    d3.select(container).select("svg")
      .style("font-family", (themeFont && themeFont.family) || null)
      // The chart backdrop (null => transparent). Covers the margin band, so a
      // dark theme's labels sit on the dark background too.
      .style("background", (this._theme && this._theme.background) || null);

    /** @param {any} event */
    const pointer = (event) => d3.pointer(event, g.node());

    this._bindPlaneGestures(plane, pointer, onEvent, planeOnTop);

    const drag = this._makeDrag(onEvent, effects.grab);
    // Keyboard access rides along with drag: same nodes, same edits.
    const keys = this._makeKeyboard(onEvent);
    // A mark-scoped click (routed to the mark's click edits, e.g. cycle /
    // remove). d3.drag suppresses the click after a real drag, so this only
    // fires on a click without movement — drag moves, click edits.
    /** @param {any} event @param {any} d */
    const markClick = (event, d) => {
      const [px, py] = pointer(event);
      onEvent({ type: "click", x: px, y: py, node: d, rawEvent: event });
    };

    // Role layers are fixed (background → guide regions → marks → guide
    // front). Within the mark layer, features/parts array order is z-order —
    // type joins still bind by shape, then we reorder DOM.
    const { background, guideRegions, marks, guideFront } = partitionScene(
      scene.children,
    );
    /** @param {any[]} list @param {string} t */
    const ofType = (list, t) =>
      list.filter((/** @type {any} */ n) => n.type === t);

    const layers = this._sceneLayers(g);

    this._drawBackground(
      layers.bg,
      ofType(background, "image"),
      ofType(background, "path"),
      ofType(background, "line"),
      ofType(background, "text"),
      ofType(background, "rect"),
      ofType(background, "circle"),
    );

    this._drawGuideRegions(layers.guideBack, guideRegions);

    // Type joins into mark-layer (binding / events); z-order fixed after.
    this._drawPaths(layers.marks, ofType(marks, "path"), {
      drag,
      markClick,
      keys,
    });
    this._drawMarks(
      layers.marks,
      ofType(marks, "rect"),
      ofType(marks, "circle"),
      { drag, markClick, keys },
    );
    this._drawLines(layers.marks, ofType(marks, "line"), {
      drag,
      markClick,
      keys,
    });
    this._drawTextMarks(layers.marks, ofType(marks, "text"), {
      drag,
      markClick,
      keys,
    });
    this._orderMarkLayer(layers.marks, marks);

    // Rules / constraint ticks / proximity rings / guide labels — in front.
    this._drawGuideFront(layers.guideFront, guideFront);

    // In plane-on-top (proximity) mode the plane must sit above the marks and
    // own all pointer events; the marks become purely visual. Guides already
    // use pointer-events:none, so they remain visible through the plane.
    if (planeOnTop) {
      g.selectAll(".mark").style("pointer-events", "none");
      plane.raise().style("cursor", planeCursor || "pointer");
    }
  }

  // -- setup ---------------------------------------------------------------

  /**
   * Once-only scaffolding: the svg, the translated scene group, the transparent
   * interaction plane, and the background layer (behind every mark). Idempotent
   * — on re-render it just returns the existing nodes.
   * @param {any} container
   * @param {{ width: number, height: number, margins: any, innerWidth: number, innerHeight: number, responsive?: string, overflow?: string }} dims
   * @returns {{ svg: any, g: any, plane: any }}
   */
  _ensureScene(
    container,
    {
      width,
      height,
      margins,
      innerWidth,
      innerHeight,
      responsive = "fixed",
      overflow = "hidden",
    },
  ) {
    /** @type {any} */
    let svg = d3.select(container).select("svg");
    if (svg.empty()) {
      svg = d3
        .select(container)
        .append("svg")
        .style("user-select", "none") // prevent text selection during drag
        .style("display", "block"); // no inline-baseline gap under the svg

      const g = svg.append("g").attr("class", "scene-container");

      // Transparent background plane, behind everything, that captures
      // interactions on empty space (used by plane-pick edits, e.g. create).
      g.append("rect")
        .attr("class", "plane")
        .attr("x", 0)
        .attr("y", 0)
        .style("fill", "transparent")
        .style("pointer-events", "all");

      // Background layer, right above the plane and behind every mark. Axes
      // and gridlines (composable marks emitting `background:true` nodes,
      // see plot/axis.js) render here so marks always sit on top of them.
      g.append("g").attr("class", "bg-layer");
      // Guide regions behind marks; mark-layer holds ordinary marks in array
      // z-order; guide-front holds rules / rings / guide labels on top.
      g.append("g").attr("class", "guide-back-layer");
      g.append("g").attr("class", "mark-layer");
      g.append("g").attr("class", "guide-front-layer");
    }

    // Sizing runs every render (not just on create) so 'reflow' picks up new
    // pixel dims and 'scale' keeps its viewBox. In 'scale' the SVG carries a
    // viewBox and stretches to 100% of the parent (aspect ratio preserved); the
    // other modes size the SVG in real pixels. `d3.pointer(_, g)` reads through
    // getScreenCTM, so gestures map correctly under a viewBox too.
    if (responsive === "scale") {
      svg
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("width", null)
        .attr("height", null)
        .style("width", "100%")
        .style("height", "auto");
    } else {
      svg
        .attr("viewBox", null)
        .attr("width", width)
        .attr("height", height)
        .style("width", null)
        .style("height", null);
    }

    // Let marks draw into the margin band (radial/gauge labels) when asked; the
    // default keeps the historical clip to the SVG viewport.
    svg.style("overflow", overflow === "visible" ? "visible" : null);

    const g = svg
      .select(".scene-container")
      .attr("transform", `translate(${margins.left},${margins.top})`);
    g.select("rect.plane")
      .attr("width", innerWidth)
      .attr("height", innerHeight);
    // Ensure role layers exist (fresh svg creates them above; a long-lived
    // container from before mark-layer existed still needs the groups).
    this._sceneLayers(g);
    return { svg, g, plane: g.select("rect.plane") };
  }

  /**
   * Role-layer groups under the scene container. Order in the DOM is the
   * paint stack: plane → bg → guide-back → marks → guide-front.
   * Only mutates the layer list when a group is first created — re-appending
   * every frame would move focused mark nodes and break keyboard editing.
   * @param {any} g scene container
   * @returns {{ bg: any, guideBack: any, marks: any, guideFront: any }}
   */
  _sceneLayers(g) {
    const hadMarkLayer = !g.select("g.mark-layer").empty();
    /** @type {string[]} */
    const created = [];
    /** @param {string} cls */
    const ensure = (cls) => {
      let layer = g.select(`g.${cls}`);
      if (layer.empty()) {
        layer = g.append("g").attr("class", cls);
        created.push(cls);
      }
      return layer;
    };
    const bg = ensure("bg-layer");
    const guideBack = ensure("guide-back-layer");
    const marks = ensure("mark-layer");
    const guideFront = ensure("guide-front-layer");
    // Pre-layer renderers joined marks as direct children of `g`. Drop those
    // orphans once when the mark-layer is introduced so they can't ghost.
    if (!hadMarkLayer) {
      g.selectAll(
        ":scope > .mark, :scope > path.mark-line, :scope > .guide-region, :scope > .guide-circle, :scope > .guide-label",
      ).remove();
    }
    if (created.length) {
      // Pin bottom→top order only when the structure changed.
      const root = /** @type {SVGGElement} */ (g.node());
      const plane = g.select("rect.plane").node();
      for (const el of [
        plane,
        bg.node(),
        guideBack.node(),
        marks.node(),
        guideFront.node(),
      ]) {
        if (el) root.appendChild(/** @type {Node} */ (el));
      }
    }
    return { bg, guideBack, marks, guideFront };
  }

  /**
   * Reorder mark-layer children so DOM z-order matches `marks` (scene order).
   * Type joins append in path→rect→circle→line→text call order; this undoes
   * that so later features/parts paint on top. Restores focus if sort moved
   * the active element (keyboard editing keeps a mark focused across redraws).
   * @param {any} markLayer
   * @param {any[]} marks
   */
  _orderMarkLayer(markLayer, marks) {
    const order = new Map(
      marks.map((/** @type {any} */ n, /** @type {number} */ i) => [n, i]),
    );
    const sel = markLayer
      .selectAll(".mark, path.mark-line")
      .filter((/** @type {any} */ d) => order.has(d));
    // Skip the DOM move when already sorted — appendChild on a focused node
    // blurs it and breaks arrow-key editing mid-gesture.
    const nodes = /** @type {Element[]} */ (sel.nodes());
    let prev = -1;
    let needsSort = false;
    for (const el of nodes) {
      const i = /** @type {number} */ (
        order.get(d3.select(el).datum())
      );
      if (i < prev) {
        needsSort = true;
        break;
      }
      prev = i;
    }
    if (!needsSort) return;

    const active = typeof document !== "undefined" ? document.activeElement : null;
    const root = /** @type {Element | null} */ (markLayer.node());
    sel.sort(
      (/** @type {any} */ a, /** @type {any} */ b) =>
        /** @type {number} */ (order.get(a)) -
        /** @type {number} */ (order.get(b)),
    );
    if (
      active &&
      root &&
      root.contains(active) &&
      typeof (/** @type {any} */ (active).focus) === "function"
    ) {
      /** @type {HTMLElement} */ (active).focus();
    }
  }

  /**
   * Wire plane gestures. `click`/`dblclick` are always available (create). In
   * plane-on-top mode we additionally drive hover + drag manually (rather than
   * via d3.drag, whose preventDefault suppresses dblclick), distinguishing a
   * click from a drag ourselves and keeping gesture state on the renderer so it
   * survives re-renders mid-drag.
   * @param {any} plane
   * @param {(event: any) => [number, number]} pointer
   * @param {(e: any) => void} onEvent
   * @param {boolean} planeOnTop
   */
  _bindPlaneGestures(plane, pointer, onEvent, planeOnTop) {
    plane
      .on("click", (/** @type {any} */ event) => {
        // A plane drag (below) ends with a native `click` on the same element.
        // Swallow that one so a drag-to-edit doesn't also fire a click-gesture
        // edit (e.g. create/anchor minting a point where the drag released).
        // A click without a preceding drag passes through untouched.
        if (this._suppressClick) {
          this._suppressClick = false;
          return;
        }
        const [px, py] = pointer(event);
        onEvent({ type: "click", x: px, y: py, rawEvent: event });
      })
      .on("dblclick", (/** @type {any} */ event) => {
        const [px, py] = pointer(event);
        onEvent({ type: "dblclick", x: px, y: py, rawEvent: event });
      });

    if (!planeOnTop) return;

    plane
      .on("pointerdown", (/** @type {any} */ event) => {
        const [px, py] = pointer(event);
        this._planeGesture = {
          startX: px,
          startY: py,
          down: true,
          dragging: false,
        };
        if (event.target.setPointerCapture) {
          try {
            event.target.setPointerCapture(event.pointerId);
          } catch (e) {
            /* ignore */
          }
        }
      })
      .on("pointermove", (/** @type {any} */ event) => {
        const [px, py] = pointer(event);
        const gesture = this._planeGesture;
        if (gesture && gesture.down) {
          if (
            !gesture.dragging &&
            Math.hypot(px - gesture.startX, py - gesture.startY) > 3
          ) {
            gesture.dragging = true;
            onEvent({
              type: "dragstart",
              x: gesture.startX,
              y: gesture.startY,
              rawEvent: event,
            });
          }
          if (gesture.dragging) {
            onEvent({ type: "drag", x: px, y: py, rawEvent: event });
          }
        } else {
          onEvent({ type: "hover", x: px, y: py, rawEvent: event });
        }
      })
      .on("pointerup", (/** @type {any} */ event) => {
        const [px, py] = pointer(event);
        const gesture = this._planeGesture;
        if (gesture && gesture.dragging) {
          onEvent({ type: "dragend", x: px, y: py, rawEvent: event });
          // Suppress the native click the browser fires next (see 'click').
          this._suppressClick = true;
        }
        this._planeGesture = null;
      })
      .on("pointerleave", (/** @type {any} */ event) => {
        if (!this._planeGesture || !this._planeGesture.down) {
          onEvent({ type: "hoverout", rawEvent: event });
        }
      });
  }

  /**
   * Keyboard access to a mark, attached wherever `drag` is. A pointer is not the
   * only way to mean "this value, please": tab to a mark and arrow-key it.
   *
   * The renderer owns the keyboard lifecycle here for the same reason it owns
   * editText's inline input — it keeps the engine ignorant of the mode. It emits a
   * `nudge`, a semantic "one step this way", NOT a pixel delta: how far a step goes
   * is a question only the scale can answer (a fixed pixel nudge is a no-op on a
   * band axis until it happens to cross an edge), and the engine resolves it into
   * the ordinary drag every edit already understands.
   *
   * Only `editable` nodes take focus: a node with no direct-pick edit has nothing
   * a keypress could do, so putting it in the tab order would be a dead stop for
   * anyone tabbing through.
   * @param {(e: any) => void} onEvent
   * @returns {(sel: any) => void}
   */
  _makeKeyboard(onEvent) {
    /** @type {Record<string, [-1 | 0 | 1, -1 | 0 | 1]>} */
    const ARROWS = {
      // [dx, dy] in PIXEL space — ArrowUp is negative y, which is why it reads
      // as "up" on screen and (on a conventional y axis) as "more".
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    return (/** @type {any} */ sel) => {
      sel
        .attr("tabindex", (/** @type {any} */ d) => (d.editable ? 0 : null))
        .attr("role", (/** @type {any} */ d) => (d.editable ? "button" : null))
        .on("keydown", (/** @type {any} */ event, /** @type {any} */ d) => {
          if (!d || !d.editable) return;
          const arrow = ARROWS[event.key];
          if (!arrow) return;
          event.preventDefault(); // don't scroll the page out from under it
          const [dx, dy] = arrow;
          onEvent({
            type: "nudge",
            node: d,
            dx,
            dy,
            coarse: !!event.shiftKey,
            rawEvent: event,
          });
        });
    };
  }

  /**
   * The drag behaviour attached to every interactive mark. clickDistance lets a
   * press that moves < N px still count as a click (d3 otherwise suppresses the
   * click on any movement), so mark-click editors fire reliably alongside drag.
   * @param {(e: any) => void} onEvent
   * @param {any} [grab] the resolved `grab` effect ({ filter } | null-filter to disable)
   * @returns {any}
   */
  _makeDrag(onEvent, grab) {
    // Grab feedback via CSS `filter` (an ELEMENT effect), NOT via the
    // `stroke`/`fill` paint attributes — those are real style channels the
    // mark may set, and mutating them here would clobber the mark's own
    // stroke (and leave it wiped until the next full re-render). `filter`
    // is not a style channel, so `_applyStyle` never touches it: it rides
    // through the mid-drag re-renders and is cleared on end with no redraw.
    // The filter string is customizable via the effects layer (core/effects.js).
    const filter =
      grab && grab.filter != null
        ? grab.filter
        : grab === undefined
          ? DEFAULT_EFFECTS.grab.filter
          : null;
    // dragstart/dragend bracket the stroke. No edit declares them as a `gesture`
    // (they match nothing in dispatch), but they tell the engine where one
    // continuous gesture begins and ends — which is what lets undo step back a
    // whole drag instead of one pointermove at a time. The plane drag already
    // emits the same three; this makes the mark drag's lifecycle match it.
    return d3
      .drag()
      .clickDistance(4)
      .on("start", function (event, d) {
        if (filter) d3.select(this).style("filter", filter);
        onEvent({
          type: "dragstart",
          x: event.x,
          y: event.y,
          node: d,
          rawEvent: event.sourceEvent,
        });
      })
      .on("drag", function (event, d) {
        // event.x/event.y are relative to the SVG scene group.
        onEvent({
          type: "drag",
          x: event.x,
          y: event.y,
          node: d,
          rawEvent: event.sourceEvent,
        });
      })
      .on("end", function (event, d) {
        if (filter) d3.select(this).style("filter", null);
        onEvent({
          type: "dragend",
          x: event.x,
          y: event.y,
          node: d,
          rawEvent: event.sourceEvent,
        });
      });
  }

  // -- style + geometry primitives -----------------------------------------

  /**
   * Apply the standard paint surface (STYLE_ATTRS) to a selection. Per-node
   * value wins; otherwise the caller's `defaults[field]` if given, else the
   * table's base default. This is the single place a style channel is applied.
   * @param {any} sel
   * @param {Record<string, any>} [defaults]
   * @returns {any}
   */
  _applyStyle(sel, defaults = {}) {
    for (const [field, attr, base] of this.STYLE_ATTRS) {
      const def = field in defaults ? defaults[field] : base;
      sel.attr(attr, (/** @type {any} */ d) =>
        d[field] != null ? d[field] : def,
      );
    }
    // Mark a probe ghost-preview node so a test (and a stylesheet) can find it. The
    // single place every mark shape's paint flows through, so one line covers all.
    sel.attr("data-ghost", (/** @type {any} */ d) => (d.ghost ? "" : null));
    return sel;
  }

  /**
   * SVG transform for a node that carries math-degree `angle` (0° = +x, CCW).
   * SVG's rotate() is clockwise in y-down space, so we negate. Pivot is the
   * mark's own centre (rect bbox, line midpoint, text anchor, …).
   * @param {any} d
   * @returns {string | null}
   */
  _angleTransform(d) {
    if (d == null || d.angle == null || d.angle === 0) return null;
    const c = markCenter(d);
    if (!c) return null;
    return `rotate(${-d.angle} ${c.cx} ${c.cy})`;
  }

  /** @param {any} sel */
  _geomRect(sel) {
    sel
      .attr("x", (/** @type {any} */ d) => d.x)
      .attr("y", (/** @type {any} */ d) => d.y)
      .attr("width", (/** @type {any} */ d) => d.width)
      .attr("height", (/** @type {any} */ d) => Math.max(0, d.height)) // no negative height
      .attr("transform", (/** @type {any} */ d) => this._angleTransform(d));
  }

  /** @param {any} sel */
  _geomCircle(sel) {
    sel
      .attr("cx", (/** @type {any} */ d) => d.cx)
      .attr("cy", (/** @type {any} */ d) => d.cy)
      .attr("r", (/** @type {any} */ d) => Math.max(0, d.r != null ? d.r : 5))
      .attr("transform", (/** @type {any} */ d) => this._angleTransform(d));
  }

  /** @param {any} sel */
  _geomLine(sel) {
    sel
      .attr("x1", (/** @type {any} */ d) => d.x1)
      .attr("x2", (/** @type {any} */ d) => d.x2)
      .attr("y1", (/** @type {any} */ d) => d.y1)
      .attr("y2", (/** @type {any} */ d) => d.y2)
      .attr("transform", (/** @type {any} */ d) => this._angleTransform(d));
  }

  /**
   * @param {any} sel
   * @param {string} [anchorDefault]
   */
  _geomText(sel, anchorDefault = "start") {
    sel
      .attr("x", (/** @type {any} */ d) => d.x)
      .attr("y", (/** @type {any} */ d) => d.y)
      .attr(
        "text-anchor",
        (/** @type {any} */ d) => d.textAnchor || anchorDefault,
      )
      // Vertical anchor (text mark's `lineAnchor` → dominant-baseline). Axis
      // tick labels leave this unset and keep the SVG default.
      .attr(
        "dominant-baseline",
        (/** @type {any} */ d) => d.dominantBaseline || null,
      )
      .attr("font-size", (/** @type {any} */ d) =>
        d.fontSize != null ? d.fontSize : this._themeFontSize(),
      )
      // Math degrees on the node; _angleTransform converts to SVG rotate.
      .attr("transform", (/** @type {any} */ d) => this._angleTransform(d))
      .text((/** @type {any} */ d) => d.text);
  }

  // -- semantic draws ------------------------------------------------------

  /**
   * Raster tiles, axis spines/ticks, gridlines, axis labels, legend swatches/
   * ramps, and vector basemap paths — into the dedicated layer behind the marks.
   * Non-interactive.
   *
   * Images are joined FIRST (and keyed by {z}/{x}/{y}), so they sit at the back
   * of the layer: a tile basemap is the floor of the chart. The key is what makes
   * panning/zooming cheap — a tile that stays on screen keeps its <image> and
   * never re-fetches. Legend rects/circles (colour chips, size dots, ramp slices)
   * and axis lines/labels follow; background paths (geoBasemap, radial chrome)
   * are last so they sit above grids the way they did when all paths shared the
   * mark path pass.
   *
   * @param {any} bgLayer
   * @param {any[]} bgImages
   * @param {any[]} bgPaths
   * @param {any[]} bgLines
   * @param {any[]} bgTexts
   * @param {any[]} [bgRects]
   * @param {any[]} [bgCircles]
   */
  _drawBackground(bgLayer, bgImages, bgPaths, bgLines, bgTexts, bgRects = [], bgCircles = []) {
    const imgSel = bgLayer
      .selectAll("image")
      .data(bgImages, (/** @type {any} */ d) => d.key)
      .join("image")
      .style("pointer-events", "none")
      .attr("x", (/** @type {any} */ d) => d.x)
      .attr("y", (/** @type {any} */ d) => d.y)
      .attr("width", (/** @type {any} */ d) => d.width)
      .attr("height", (/** @type {any} */ d) => d.height)
      .attr("transform", (/** @type {any} */ d) => this._angleTransform(d))
      // Tiles are photographic: let the browser smooth them when a fitted
      // (fractional) zoom scales them off their native 256px.
      .attr("preserveAspectRatio", "none")
      .attr("href", (/** @type {any} */ d) => d.href)
      .attr("opacity", (/** @type {any} */ d) =>
        d.opacity != null ? d.opacity : null,
      );
    imgSel.lower();

    // Legend colour chips / ramp slices / opacity swatches. Painted before axis
    // lines so a side legend's labels (bg texts) sit on top of its chips.
    const rectSel = bgLayer
      .selectAll("rect.bg-rect")
      .data(bgRects)
      .join("rect")
      .attr("class", "bg-rect")
      .style("pointer-events", "none");
    this._geomRect(rectSel);
    this._applyStyle(rectSel, { fill: "none", stroke: "none", strokeWidth: 1, opacity: 1 });

    // Legend size dots (a size channel encodes to a radius, drawn as a circle).
    const circleSel = bgLayer
      .selectAll("circle.bg-circle")
      .data(bgCircles)
      .join("circle")
      .attr("class", "bg-circle")
      .style("pointer-events", "none");
    this._geomCircle(circleSel);
    this._applyStyle(circleSel, { fill: "none", stroke: "none", strokeWidth: 1, opacity: 1 });

    const lineSel = bgLayer
      .selectAll("line")
      .data(bgLines)
      .join("line")
      .style("pointer-events", "none");
    this._geomLine(lineSel);
    this._applyStyle(lineSel, {
      stroke: "#6b7280",
      strokeWidth: 1,
      opacity: 1,
    });

    const textSel = bgLayer
      .selectAll("text")
      .data(bgTexts)
      .join("text")
      .style("pointer-events", "none");
    this._geomText(textSel, "middle");
    this._applyStyle(textSel, { fill: "#374151", opacity: 1 });

    const pathSel = bgLayer
      .selectAll("path.bg-path")
      .data(bgPaths)
      .join("path")
      .attr("class", "bg-path")
      .style("pointer-events", "none")
      .attr("d", (/** @type {any} */ d) => {
        if (d.d) return d.d;
        return d3.line().curve(resolveCurve(d.curve))(d.points || []);
      });
    this._applyStyle(pathSel, {
      fill: "none",
      stroke: "black",
      strokeWidth: 1,
      opacity: 1,
    });
  }

  /**
   * Non-interactive guide regions (shaded bands / outlines), drawn behind marks.
   * @param {any} layer
   * @param {any[]} guideRects
   */
  _drawGuideRegions(layer, guideRects) {
    const rectSel = layer
      .selectAll("rect.guide-region")
      .data(guideRects)
      .join("rect")
      .attr("class", "guide-region")
      .style("pointer-events", "none");
    this._geomRect(rectSel);
    this._applyStyle(rectSel, {
      fill: "none",
      stroke: "none",
      strokeWidth: 1,
      opacity: 1,
    });
  }

  /**
   * Non-interactive guide annotations in front of marks: lines (rules /
   * constraint ticks), circles (proximity rings), paths, and text labels.
   * Drawn in `guideFront` scene order so a rule's line stays with its label.
   * @param {any} layer
   * @param {any[]} nodes
   */
  _drawGuideFront(layer, nodes) {
    /** @param {string} t */
    const ofType = (t) =>
      nodes.filter((/** @type {any} */ n) => n.type === t);

    const lineSel = layer
      .selectAll("line.guide-line")
      .data(ofType("line"))
      .join("line")
      .attr("class", "guide-line")
      .style("pointer-events", "none");
    this._geomLine(lineSel);
    this._applyStyle(lineSel, {
      stroke: "black",
      strokeWidth: 1,
      opacity: 1,
    });

    const circleSel = layer
      .selectAll("circle.guide-circle")
      .data(ofType("circle"))
      .join("circle")
      .attr("class", "guide-circle")
      .style("pointer-events", "none");
    this._geomCircle(circleSel);
    this._applyStyle(circleSel, {
      fill: "none",
      stroke: "none",
      strokeWidth: 1,
      opacity: 1,
    });

    const pathSel = layer
      .selectAll("path.guide-path")
      .data(ofType("path"))
      .join("path")
      .attr("class", "guide-path")
      .style("pointer-events", "none")
      .attr("d", (/** @type {any} */ d) => {
        if (d.d) return d.d;
        return d3.line().curve(resolveCurve(d.curve))(d.points || []);
      });
    this._applyStyle(pathSel, {
      fill: "none",
      stroke: "black",
      strokeWidth: 1,
      opacity: 1,
    });

    const textSel = layer
      .selectAll("text.guide-label")
      .data(ofType("text"))
      .join("text")
      .attr("class", "guide-label")
      .style("pointer-events", "none");
    this._geomText(textSel, "start");
    this._applyStyle(textSel, { fill: "black", opacity: 1 });

    // Type joins append in call order; restore scene order among guide-front
    // siblings so a rule's stroke isn't covered by an earlier proximity ring.
    const order = new Map(
      nodes.map((/** @type {any} */ n, /** @type {number} */ i) => [n, i]),
    );
    layer
      .selectAll(
        "line.guide-line, circle.guide-circle, path.guide-path, text.guide-label",
      )
      .filter((/** @type {any} */ d) => order.has(d))
      .sort(
        (/** @type {any} */ a, /** @type {any} */ b) =>
          /** @type {number} */ (order.get(a)) -
          /** @type {number} */ (order.get(b)),
      );
  }

  /**
   * Interactive marks: rects (bars) and circles (dots). Both get the click +
   * drag wiring; only nodes flagged `editable` (their feature has a direct-pick
   * edit) show an interactive cursor — d3.drag/click is inert on the rest.
   * DOM z-order among mark types is fixed later by `_orderMarkLayer`.
   * @param {any} layer
   * @param {any[]} markRects
   * @param {any[]} markCircles
   * @param {{ drag: any, markClick: (e: any, d: any) => void, keys: (sel: any) => void }} io
   */
  _drawMarks(layer, markRects, markCircles, { drag, markClick, keys }) {
    // A mark may opt OUT of the pointer (pointerEvents: 'none') — a ghost/affordance
    // node, or a glyph part that must not swallow the plane's hover/click. Without
    // this a decorative circle would eat the gesture the plane driver needs, the
    // same way line marks and paths already honour the flag.
    const rectSel = layer
      .selectAll("rect.mark")
      .data(markRects)
      .join("rect")
      .attr("class", "mark")
      .style(
        "pointer-events",
        (/** @type {any} */ d) => d.pointerEvents || "auto",
      )
      .style("cursor", (/** @type {any} */ d) =>
        d.editable ? d.cursor || "ns-resize" : "default",
      )
      .on("click", markClick)
      .call(drag)
      .call(keys);
    this._geomRect(rectSel);
    this._applyStyle(rectSel, { fill: "black" });

    const circleSel = layer
      .selectAll("circle.mark")
      .data(markCircles)
      .join("circle")
      .attr("class", "mark")
      .style(
        "pointer-events",
        (/** @type {any} */ d) => d.pointerEvents || "auto",
      )
      .style("cursor", (/** @type {any} */ d) =>
        d.editable ? "move" : "default",
      )
      .on("click", markClick)
      .call(drag)
      .call(keys);
    this._geomCircle(circleSel);
    this._applyStyle(circleSel, { fill: "black" });
  }

  /**
   * Foreground lines. Two roles share one draw:
   *   - reference rules / guide boundaries: non-interactive (often
   *     pointerEvents:'none') — drawn as before.
   *   - interactive line marks (ticks): flagged `editable`, so they get the same
   *     click + drag wiring as rect/circle marks. Only editable nodes show an
   *     interactive cursor; d3.drag is inert on the rest.
   * @param {any} layer
   * @param {any[]} lines
   * @param {{ drag: any, markClick: (e: any, d: any) => void, keys: (sel: any) => void }} io
   */
  _drawLines(layer, lines, { drag, markClick, keys }) {
    const sel = layer
      .selectAll("line.mark")
      .data(lines)
      .join("line")
      .attr("class", "mark")
      .style(
        "pointer-events",
        (/** @type {any} */ d) => d.pointerEvents || "auto",
      )
      .style("cursor", (/** @type {any} */ d) =>
        d.editable ? d.cursor || "move" : "default",
      )
      .on("click", markClick)
      .call(drag)
      .call(keys);
    this._geomLine(sel);
    this._applyStyle(sel, { stroke: "black", strokeWidth: 1, opacity: 1 });
  }

  /**
   * Path marks: connecting lines (points + curve) OR authored SVG `d` strings
   * (arcs, needles, pie slices). Non-interactive by default — line connectors
   * are edited through handle dots — but an `editable` path (needle, pie slice)
   * gets the same click + drag wiring as other marks.
   * @param {any} layer
   * @param {any[]} paths
   * @param {{ drag: any, markClick: (e: any, d: any) => void, keys: (sel: any) => void }} [io]
   */
  _drawPaths(layer, paths, io) {
    const sel = layer
      .selectAll("path.mark-line")
      .data(paths)
      .join("path")
      .attr("class", "mark-line")
      .style(
        "pointer-events",
        (/** @type {any} */ d) =>
          d.pointerEvents || (d.editable ? "auto" : "none"),
      )
      .style("cursor", (/** @type {any} */ d) =>
        d.editable ? d.cursor || "pointer" : "default",
      )
      .attr("d", (/** @type {any} */ d) => {
        if (d.d) return d.d;
        return d3.line().curve(resolveCurve(d.curve))(d.points || []);
      });
    this._applyStyle(sel, {
      fill: "none",
      stroke: "black",
      strokeWidth: 1,
      opacity: 1,
    });
    if (io) {
      sel.on("click", io.markClick).call(io.drag).call(io.keys);
    }
  }

  /**
   * Text marks (editable or inert). Mirrors _drawMarks: click + drag wiring,
   * cursor only when editable, honoring a mark's pointerEvents opt-out.
   * Double-click opens an inline editor for content editing (see _editText).
   * @param {any} layer
   * @param {any[]} texts
   * @param {{ drag: any, markClick: (e: any, d: any) => void, keys: (sel: any) => void }} io
   */
  _drawTextMarks(layer, texts, { drag, markClick, keys }) {
    const sel = layer
      .selectAll("text.mark")
      .data(texts)
      .join("text")
      .attr("class", "mark")
      .style(
        "pointer-events",
        (/** @type {any} */ d) => d.pointerEvents || "auto",
      )
      .style("cursor", (/** @type {any} */ d) =>
        d.editable ? d.cursor || "move" : "default",
      )
      .on("click", markClick)
      .on("dblclick", (/** @type {any} */ event, /** @type {any} */ d) => {
        // Stop the browser's synthetic click/drag noise and keep dblclick
        // from racing a dragstart when drag + editText share one mark.
        event.preventDefault();
        event.stopPropagation();
        this._editText(event, d);
      })
      .call(drag)
      .call(keys);
    this._geomText(sel, "middle");
    this._applyStyle(sel, { fill: "black", opacity: 1 });
  }

  /**
   * Inline content editor for a text mark. On double-click of a node that opted in
   * (`editText: true`, set by the mark when an editText edit is wired) mount a
   * `<foreignObject>` input over the label; Enter/blur emits a `commit` gesture
   * carrying the typed string (the editText edit stores it), Esc cancels. The
   * renderer owns the keyboard lifecycle so the engine stays pointer/mode-agnostic.
   * @param {any} event
   * @param {any} d the text node
   */
  _editText(event, d) {
    if (!d || !d.editText) return;
    const g = this._sceneG;
    const onEvent = this._onEvent;
    if (!g || !onEvent) return;

    // Only one editor at a time.
    g.selectAll("foreignObject.text-editor").remove();

    const size = d.fontSize != null ? d.fontSize : 12;
    const w = 140;
    const h = size + 10;
    const fo = g
      .append("foreignObject")
      .attr("class", "text-editor")
      .attr("x", d.x - w / 2)
      .attr("y", d.y - h + 4)
      .attr("width", w)
      .attr("height", h);
    const input = /** @type {HTMLInputElement} */ (
      fo
        .append("xhtml:input")
        .attr("type", "text")
        .style("width", "100%")
        .style("box-sizing", "border-box")
        .style("font-size", size + "px")
        .style("text-align", "center")
        .node()
    );
    input.value = d.text != null ? String(d.text) : "";
    input.focus();
    input.select();

    let done = false;
    const commit = () => {
      if (done) return;
      done = true;
      const value = input.value;
      fo.remove();
      onEvent({
        type: "commit",
        node: d,
        value,
        x: d.x,
        y: d.y,
        rawEvent: event,
      });
    };
    const cancel = () => {
      if (done) return;
      done = true;
      fo.remove();
    };
    input.addEventListener("keydown", (/** @type {KeyboardEvent} */ e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
      e.stopPropagation();
    });
    input.addEventListener("blur", commit);
  }

}
