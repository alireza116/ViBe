import * as d3 from 'd3';

export class D3Renderer {
    render(context) {
        const { container, scene, width, height, margins, scales, onEvent, planeOnTop = false } = context;

        const innerWidth = width - margins.left - margins.right;
        const innerHeight = height - margins.top - margins.bottom;

        // Ensure SVG exists
        let svg = d3.select(container).select('svg');
        if (svg.empty()) {
            svg = d3.select(container).append('svg')
                .attr('width', width)
                .attr('height', height)
                .style('user-select', 'none'); // prevent text selection during drag

            const g = svg.append('g')
                .attr('class', 'scene-container')
                .attr('transform', `translate(${margins.left},${margins.top})`);

            // Transparent background plane, behind everything, that captures
            // interactions on empty space (used by plane-target "create" interactors).
            g.append('rect')
                .attr('class', 'plane')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', innerWidth)
                .attr('height', innerHeight)
                .style('fill', 'transparent')
                .style('pointer-events', 'all');

            // Draw Axes once (for now). Either scale may be absent (1D plots).
            if (scales.x) {
                g.append('g')
                    .attr('class', 'x-axis')
                    .attr('transform', `translate(0,${innerHeight})`)
                    .call(d3.axisBottom(scales.x));
            }
            if (scales.y) {
                g.append('g')
                    .attr('class', 'y-axis')
                    .call(d3.axisLeft(scales.y));
            }
        }

        const g = svg.select('.scene-container');
        const plane = g.select('rect.plane');
        const pointer = (event) => d3.pointer(event, g.node());

        // Plane gestures emit node-less events that the core routes to plane
        // interactors. `click`/`dblclick` are always available (create). In
        // plane-on-top mode we additionally drive hover + drag gestures manually
        // (rather than via d3.drag, whose preventDefault suppresses dblclick),
        // distinguishing a click from a drag ourselves and keeping gesture state
        // on the renderer instance so it survives re-renders mid-drag.
        plane
            .on('click', (event) => {
                const [px, py] = pointer(event);
                onEvent({ type: 'click', x: px, y: py, rawEvent: event });
            })
            .on('dblclick', (event) => {
                const [px, py] = pointer(event);
                onEvent({ type: 'dblclick', x: px, y: py, rawEvent: event });
            });

        if (planeOnTop) {
            plane
                .on('pointerdown', (event) => {
                    const [px, py] = pointer(event);
                    this._planeGesture = { startX: px, startY: py, down: true, dragging: false };
                    if (event.target.setPointerCapture) {
                        try { event.target.setPointerCapture(event.pointerId); } catch (e) { /* ignore */ }
                    }
                })
                .on('pointermove', (event) => {
                    const [px, py] = pointer(event);
                    const gesture = this._planeGesture;
                    if (gesture && gesture.down) {
                        if (!gesture.dragging && Math.hypot(px - gesture.startX, py - gesture.startY) > 3) {
                            gesture.dragging = true;
                            onEvent({ type: 'dragstart', x: gesture.startX, y: gesture.startY, rawEvent: event });
                        }
                        if (gesture.dragging) {
                            onEvent({ type: 'drag', x: px, y: py, rawEvent: event });
                        }
                    } else {
                        onEvent({ type: 'hover', x: px, y: py, rawEvent: event });
                    }
                })
                .on('pointerup', (event) => {
                    const [px, py] = pointer(event);
                    const gesture = this._planeGesture;
                    if (gesture && gesture.dragging) {
                        onEvent({ type: 'dragend', x: px, y: py, rawEvent: event });
                    }
                    this._planeGesture = null;
                })
                .on('pointerleave', (event) => {
                    if (!this._planeGesture || !this._planeGesture.down) {
                        onEvent({ type: 'hoverout', rawEvent: event });
                    }
                });
        }

        // Setup drag behavior. clickDistance lets a press that moves < N px still
        // count as a click (d3 otherwise suppresses the click on any movement),
        // so mark-click editors like cycleChannel fire reliably alongside drag.
        const dragBehavior = d3.drag()
            .clickDistance(4)
            .on('start', function(event, d) {
                // optional visual feedback
                d3.select(this).attr('stroke', 'black');
            })
            .on('drag', function(event, d) {
                // Fire the synthetic event to the core
                // event.x/event.y are relative to the SVG container 'g'
                onEvent({
                    type: 'drag',
                    x: event.x,
                    y: event.y,
                    node: d, // The abstract scene node
                    rawEvent: event.sourceEvent
                });
            })
            .on('end', function(event, d) {
                d3.select(this).attr('stroke', null);
            });

        // Split nodes by type/role. Guide regions are drawn first (behind marks),
        // then interactive mark rects, then lines, then text labels — so guides
        // read as background/foreground annotations rather than targets.
        const allRects = scene.children.filter(n => n.type === 'rect');
        const guideRects = allRects.filter(n => n.guide);
        const markRects = allRects.filter(n => !n.guide);
        const allCircles = scene.children.filter(n => n.type === 'circle');
        const guideCircles = allCircles.filter(n => n.guide);
        const markCircles = allCircles.filter(n => !n.guide);
        const lines = scene.children.filter(n => n.type === 'line');
        const texts = scene.children.filter(n => n.type === 'text');

        // Render guide regions (non-interactive shaded bands / outlines)
        g.selectAll('rect.guide-region')
            .data(guideRects)
            .join('rect')
            .attr('class', 'guide-region')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('width', d => d.width)
            .attr('height', d => Math.max(0, d.height))
            .attr('fill', d => d.fill || 'none')
            .attr('stroke', d => d.stroke || 'none')
            .attr('stroke-width', d => d.strokeWidth != null ? d.strokeWidth : 1)
            .attr('opacity', d => d.opacity != null ? d.opacity : 1)
            .style('pointer-events', 'none');

        // Fire a mark-scoped click (routed to the mark's click interactors, e.g.
        // cycleChannel). d3.drag suppresses the click after a real drag, so this
        // only fires on a click without movement — drag moves, click edits.
        const markClick = (event, d) => {
            const [px, py] = pointer(event);
            onEvent({ type: 'click', x: px, y: py, node: d, rawEvent: event });
        };

        // Render mark Rects
        g.selectAll('rect.mark')
            .data(markRects)
            .join('rect')
            .attr('class', 'mark')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('width', d => d.width)
            .attr('height', d => Math.max(0, d.height)) // prevent negative height
            .attr('fill', d => d.fill || 'black')
            .style('cursor', d => (d.interactors && d.interactors.length > 0) ? 'ns-resize' : 'default')
            .on('click', markClick)
            .call(dragBehavior); // attach drag to all rects; only nodes with interactors change state

        // Render mark Circles (scatter dots)
        g.selectAll('circle.mark')
            .data(markCircles)
            .join('circle')
            .attr('class', 'mark')
            .attr('cx', d => d.cx)
            .attr('cy', d => d.cy)
            .attr('r', d => d.r != null ? d.r : 5)
            .attr('fill', d => d.fill || 'black')
            .style('cursor', d => (d.interactors && d.interactors.length > 0) ? 'move' : 'default')
            .on('click', markClick)
            .call(dragBehavior);

        // Render guide Circles (non-interactive: proximity rings / highlights)
        g.selectAll('circle.guide-circle')
            .data(guideCircles)
            .join('circle')
            .attr('class', 'guide-circle')
            .attr('cx', d => d.cx)
            .attr('cy', d => d.cy)
            .attr('r', d => Math.max(0, d.r != null ? d.r : 5))
            .attr('fill', d => d.fill || 'none')
            .attr('stroke', d => d.stroke || 'none')
            .attr('stroke-width', d => d.strokeWidth != null ? d.strokeWidth : 1)
            .attr('stroke-dasharray', d => d.strokeDasharray || null)
            .attr('opacity', d => d.opacity != null ? d.opacity : 1)
            .style('pointer-events', 'none');

        // Render Lines (reference rules and guide boundaries)
        g.selectAll('line.mark')
            .data(lines)
            .join('line')
            .attr('class', 'mark')
            .attr('x1', d => d.x1)
            .attr('x2', d => d.x2)
            .attr('y1', d => d.y1)
            .attr('y2', d => d.y2)
            .attr('stroke', d => d.stroke || 'black')
            .attr('stroke-width', d => d.strokeWidth != null ? d.strokeWidth : 1)
            .attr('stroke-dasharray', d => d.strokeDasharray || null)
            .attr('opacity', d => d.opacity != null ? d.opacity : 1)
            .style('pointer-events', d => d.pointerEvents || 'auto');

        // Render Text labels (guide annotations)
        g.selectAll('text.guide-label')
            .data(texts)
            .join('text')
            .attr('class', 'guide-label')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('text-anchor', d => d.textAnchor || 'start')
            .attr('fill', d => d.fill || 'black')
            .attr('font-size', d => d.fontSize != null ? d.fontSize : 10)
            .attr('opacity', d => d.opacity != null ? d.opacity : 1)
            .style('pointer-events', 'none')
            .text(d => d.text);

        // In plane-on-top (proximity) mode the plane must sit above the marks and
        // own all pointer events; the marks become purely visual. Guides use
        // pointer-events:none already, so they remain visible through the
        // transparent plane.
        if (planeOnTop) {
            g.selectAll('.mark').style('pointer-events', 'none');
            plane.raise().style('cursor', 'pointer');
        }
    }
}
