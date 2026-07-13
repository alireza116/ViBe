import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/marks/geo",
  "title": "Geo",
  "lead": "Geographic marks for map elicitation. Set chart-level <code class=\"inline\">projection</code> (Plot-style: <code class=\"inline\">\"mercator\"</code>, <code class=\"inline\">{ type, domain, … }</code>, or a live d3.geo* instance). Position uses <b>apply / invert</b> on that shared projection — not x/y scales. Provide basemap topology with <code class=\"inline\">geoBasemap({ geojson })</code> (a GeoJSON FeatureCollection / Feature / Geometry). Editable overlays live on the <b>dataset</b>. Examples below use Vancouver’s 22 local areas (<code class=\"inline\">vancouver</code> in the docs scope — replace with your own file).",
  "api": [
    {
      "name": "projection (ElicitSpec)",
      "summary": "Chart option. Built once per layout into <code class=\"inline\">scales.projection</code> with <code class=\"inline\">apply</code>, <code class=\"inline\">invert</code>, and <code class=\"inline\">path</code>. Fit with <code class=\"inline\">domain: geojson</code>. Auto axes default off when set.",
      "signatures": [
        "projection: \"mercator\" | \"albers-usa\" | \"equirectangular\" | …",
        "projection: { type, domain?, rotate?, inset?, … }"
      ]
    },
    {
      "name": "geoBasemap({ geojson, … })",
      "summary": "Inert background map. Pass topology as a mark option — <code class=\"inline\">geojson</code> (or <code class=\"inline\">features</code>) — not as <code class=\"inline\">Elicit</code> data. Load your own: <code class=\"inline\">const map = await fetch(\"…\").then(r => r.json())</code> then <code class=\"inline\">geoBasemap({ geojson: map })</code>. A FeatureCollection draws <b>one path per feature</b> so boundaries show.",
      "signatures": [
        "geoBasemap({ geojson, fill, stroke, strokeWidth, id }) → Feature"
      ],
      "options": [
        {
          "name": "geojson",
          "type": "GeoJSON",
          "default": "—",
          "desc": "FeatureCollection, Feature, or Geometry. Required for a visible basemap."
        },
        {
          "name": "features",
          "type": "GeoJSON",
          "default": "—",
          "desc": "Alias of <code class=\"inline\">geojson</code>."
        },
        {
          "name": "fill / stroke / strokeWidth",
          "type": "style",
          "default": "'#e2e8f0' / '#94a3b8' / 0.75",
          "desc": "Chrome styling (also via channels)."
        }
      ]
    },
    {
      "name": "geoTile({ url, … })",
      "summary": "Raster basemap from a slippy-map tile server (OSM, CARTO, satellite, your own) — the Leaflet model. <b>Requires <code class=\"inline\">projection: \"mercator\"</code></b>: tiles are images baked in Web Mercator and cannot register under another projection (the mark verifies this by <i>behaviour</i>, not by name, and warns instead of misaligning). Chrome, like geoBasemap — takes no data. Compose the two to draw boundaries over imagery.",
      "signatures": [
        "geoTile() → Feature  // OSM standard + attribution",
        "geoTile({ url, subdomains, opacity, attribution, minZoom, maxZoom, zoomOffset }) → Feature"
      ],
      "options": [
        {
          "name": "url",
          "type": "string | fn",
          "default": "OSM standard",
          "desc": "Template <code class=\"inline\">{s}/{z}/{x}/{y}</code>, or a function of the tile."
        },
        {
          "name": "subdomains",
          "type": "string[]",
          "default": "[]",
          "desc": "Hosts to rotate <code class=\"inline\">{s}</code> across (e.g. a, b, c)."
        },
        {
          "name": "opacity",
          "type": "number",
          "default": "1",
          "desc": "Dim the imagery so overlaid data reads."
        },
        {
          "name": "attribution",
          "type": "string | null",
          "default": "\"© OpenStreetMap contributors\"",
          "desc": "Drawn bottom-right. A licence condition of every tile service — only pass null if you render the credit yourself."
        },
        {
          "name": "zoomOffset / minZoom / maxZoom",
          "type": "number",
          "default": "0 / 0 / 19",
          "desc": "Nudge or clamp the chosen zoom level (picked from the fitted scale)."
        }
      ],
      "returns": "A Feature emitting image nodes into the background layer, keyed by {z}/{x}/{y} so on-screen tiles survive a re-render without re-fetching."
    },
    {
      "name": "geoPoint / geoPolygon / geoLine / geoText / geoRect",
      "summary": "Editable overlays. Import from <code class=\"inline\">vibe.plot</code>. <code class=\"inline\">geoText</code> is <code class=\"inline\">text</code> with the projection doing the placement — it shares the node shape, so <code class=\"inline\">editText</code> / <code class=\"inline\">cycle</code> / <code class=\"inline\">rotate</code> work on it unchanged.",
      "signatures": [
        "geoPoint({ channels: { lon, lat, size, fill }, edits }) → Feature",
        "geoPolygon({ channels: { geometry, fill } }) → Feature",
        "geoLine({ channels: { coordinates }, showVertices }) → Feature  // one line per row",
        "geoLine({ channels: { lon, lat }, order, series }) → Feature    // one path across rows",
        "geoText({ channels: { lon, lat, text }, dx, dy, format }) → Feature",
        "geoRect({ channels: { west, south, east, north } }) → Feature"
      ],
      "channels": [
        {
          "name": "lon / lat",
          "type": "quantitative",
          "desc": "Position in degrees. One dot per row on geoPoint, the anchor on geoText; on geoLine, connects the rows into one path."
        },
        {
          "name": "geometry",
          "type": "GeoJSON",
          "desc": "geoPolygon path geometry on each row."
        },
        {
          "name": "coordinates",
          "type": "[[lon,lat],…]",
          "desc": "geoLine vertex list (one line per row)."
        },
        {
          "name": "text",
          "type": "string",
          "desc": "geoText label content (raw, unscaled). Retype it with <code class=\"inline\">editText()</code>."
        },
        {
          "name": "fontSize / textAnchor / lineAnchor / angle",
          "type": "literal",
          "desc": "geoText glyph channels — same as the <code class=\"inline\">text</code> mark."
        },
        {
          "name": "dx / dy",
          "type": "px",
          "desc": "geoText visual nudge off the anchor (does not move the lon/lat a drag writes)."
        },
        {
          "name": "west/south/east/north",
          "type": "quantitative",
          "desc": "geoRect geographic AABB."
        },
        {
          "name": "fill / stroke / size",
          "type": "style",
          "desc": "Ordinary style scales (not projected)."
        }
      ],
      "returns": "Features emitting path / circle / text / rect nodes in projected pixel space."
    },
    {
      "name": "edit.geo.*",
      "summary": "Geo-scoped edits (<code class=\"inline\">scope: \"geo\"</code>). Invert the pointer through the chart projection.",
      "signatures": [
        "edit.geo.drag() — move a geoPoint",
        "edit.geo.create() — click to place a lon/lat row",
        "edit.geo.draw() — drag to author a coordinates list",
        "edit.geo.dragVertex() — move a geoLine vertex handle",
        "edit.geo.brush({ move, edgeInset }) — resize/move a geoRect (geoBrush driver)",
        "edit.geo.createRect({ width, height }) — click open map to mint a bbox (degrees)"
      ]
    }
  ],
  "sections": [
    {
      "id": "basemap",
      "title": "Providing basemap data",
      "intro": "The basemap is chrome: pass GeoJSON into geoBasemap. Fit the projection with the same object as domain so the map fills the frame. Below, `vancouver` is the docs sample (22 local areas); your app would import or fetch its own.",
      "examples": [
        "marks-geo/vancouver-local-areas"
      ]
    },
    {
      "id": "tiles",
      "title": "Real basemaps (OSM raster tiles)",
      "intro": "For an actual map under your data — streets, water, labels — use <code class=\"inline\">geoTile()</code>: the Leaflet model, a pyramid of 256px images from a tile server, laid on the plane behind the marks. <b>It requires <code class=\"inline\">projection: \"mercator\"</code></b> (unrotated). A tile is a pre-rendered picture baked in Web Mercator, so under any other projection it cannot be made to register with the data; the mark checks the projection's behaviour, draws nothing, and warns rather than showing you a misaligned map. Everything else is unchanged — the same lon/lat marks and the same edit.geo.* gestures ride on top, because they still go through the same projection. <b>Attribution is a licence condition</b> of every tile service and is drawn by default. Public OSM tiles are rate-limited and not meant for production traffic: point <code class=\"inline\">url</code> at your own server or a paid provider when you ship.",
      "examples": [
        "marks-geo/pins-on-openstreetmap",
        "marks-geo/tiles-under-the-neighborhood-outlines"
      ]
    },
    {
      "id": "points",
      "title": "Place / move points on the map",
      "intro": "geoPoint overlays sit on the same projection. Click empty space to add; drag to move. Lon/lat come back through onChange / getData().",
      "examples": [
        "marks-geo/belief-pins-on-vancouver"
      ]
    },
    {
      "id": "labels",
      "title": "Label and rename places",
      "intro": "A label on a map is an ordinary <b>text</b> mark that happens to be positioned by the projection — so <code class=\"inline\">geoText</code> is the only geo-specific part, and every text behaviour comes along free: <code class=\"inline\">editText()</code> to retype the content, <code class=\"inline\">cycle()</code> to advance a categorical label, <code class=\"inline\">rotate()</code> on <code class=\"inline\">angle</code>. Give it its own feature next to a geoPoint and the two read the same rows: drag the dot and the name follows. <code class=\"inline\">dx</code>/<code class=\"inline\">dy</code> nudge the glyph off the anchor without touching the lon/lat a drag writes.",
      "examples": [
        "marks-geo/named-pins-you-can-rename"
      ]
    },
    {
      "id": "polygons",
      "title": "Recolor neighborhoods",
      "intro": "Editable regions are dataset rows with a geometry field — a subset of the basemap features promoted into data. The basemap stays inert chrome underneath.",
      "examples": [
        "marks-geo/cycle-fill-on-selected-local-areas"
      ]
    },
    {
      "id": "lines",
      "title": "Draw lines over the city",
      "intro": "Author a route as [lon, lat] pairs on top of the neighborhoods. Vertex reshape uses edit.geo.dragVertex on a seeded line (keep draw and vertex-drag on separate charts — draw raises the plane above marks).",
      "examples": [
        "marks-geo/draw-a-path-across-vancouver",
        "marks-geo/reshape-a-seeded-broadway-ish-line"
      ]
    },
    {
      "id": "connected",
      "title": "Connected scatter over the map",
      "intro": "Give geoLine <code class=\"inline\">lon</code>/<code class=\"inline\">lat</code> channels instead of <code class=\"inline\">coordinates</code> and it connects the dataset's <b>rows</b> into one path — the geographic sibling of the <code class=\"inline\">path</code> mark. Points ride on a separate geoPoint feature, so dragging a stop reshapes the trail: the line re-derives from the same rows on the next render. Order defaults to <code class=\"inline\">\"sequence\"</code> (array order); pass a field name to sort by it, or <code class=\"inline\">series</code> to draw one trail per group.",
      "examples": [
        "marks-geo/a-route-across-vancouver"
      ]
    },
    {
      "id": "rects",
      "title": "Geographic rectangles",
      "intro": "Boxes are axis-aligned in lon/lat (they may look slightly curved under Mercator). Grab an <b>edge</b> or <b>corner</b> to reshape, the <b>body</b> to move, and click empty space to mint another. The zone you grabbed is latched at dragstart by the <code class=\"inline\">geoBrush</code> driver and held for the whole gesture, so a move never turns into a resize halfway through; the cursor tells you which zone you're in before you press.",
      "examples": [
        "marks-geo/study-areas-over-the-city"
      ]
    }
  ]
};

export default page;
