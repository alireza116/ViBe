// Geo marks — chart projection + mini GIS elicitation over a real basemap.
// Basemap GeoJSON is a mark option (`geoBasemap({ geojson })`), not the elicited
// dataset. Docs inject `vancouver` (City of Vancouver local areas); swap in any
// FeatureCollection the same way.

export default {
    path: 'marks/geo.html',
    title: 'Geo',
    lead:
        'Geographic marks for map elicitation. Set chart-level ' +
        '<code class="inline">projection</code> (Plot-style: ' +
        '<code class="inline">"mercator"</code>, ' +
        '<code class="inline">{ type, domain, … }</code>, or a live d3.geo* instance). ' +
        'Position uses <b>apply / invert</b> on that shared projection — not x/y scales. ' +
        'Provide basemap topology with <code class="inline">geoBasemap({ geojson })</code> ' +
        '(a GeoJSON FeatureCollection / Feature / Geometry). Editable overlays live on the ' +
        '<b>dataset</b>. Examples below use Vancouver’s 22 local areas ' +
        '(<code class="inline">vancouver</code> in the docs scope — replace with your own file).',
    api: [
        {
            name: 'projection (ElicitSpec)',
            summary:
                'Chart option. Built once per layout into <code class="inline">scales.projection</code> ' +
                'with <code class="inline">apply</code>, <code class="inline">invert</code>, and ' +
                '<code class="inline">path</code>. Fit with <code class="inline">domain: geojson</code>. ' +
                'Auto axes default off when set.',
            signatures: [
                'projection: "mercator" | "albers-usa" | "equirectangular" | …',
                'projection: { type, domain?, rotate?, inset?, … }',
            ],
        },
        {
            name: 'geoBasemap({ geojson, … })',
            summary:
                'Inert background map. Pass topology as a mark option — ' +
                '<code class="inline">geojson</code> (or <code class="inline">features</code>) — ' +
                'not as <code class="inline">Elicit</code> data. Load your own: ' +
                '<code class="inline">const map = await fetch("…").then(r => r.json())</code> ' +
                'then <code class="inline">geoBasemap({ geojson: map })</code>. ' +
                'A FeatureCollection draws <b>one path per feature</b> so boundaries show.',
            signatures: [
                'geoBasemap({ geojson, fill, stroke, strokeWidth, id }) → Feature',
            ],
            options: [
                { name: 'geojson', type: 'GeoJSON', default: '—', desc: 'FeatureCollection, Feature, or Geometry. Required for a visible basemap.' },
                { name: 'features', type: 'GeoJSON', default: '—', desc: 'Alias of <code class="inline">geojson</code>.' },
                { name: 'fill / stroke / strokeWidth', type: 'style', default: "'#e2e8f0' / '#94a3b8' / 0.75", desc: 'Chrome styling (also via channels).' },
            ],
        },
        {
            name: 'geoTile({ url, … })',
            summary:
                'Raster basemap from a slippy-map tile server (OSM, CARTO, satellite, your own) — ' +
                'the Leaflet model. <b>Requires <code class="inline">projection: "mercator"</code></b>: ' +
                'tiles are images baked in Web Mercator and cannot register under another projection ' +
                '(the mark verifies this by <i>behaviour</i>, not by name, and warns instead of ' +
                'misaligning). Chrome, like geoBasemap — takes no data. Compose the two to draw ' +
                'boundaries over imagery.',
            signatures: [
                'geoTile() → Feature  // OSM standard + attribution',
                'geoTile({ url, subdomains, opacity, attribution, minZoom, maxZoom, zoomOffset }) → Feature',
            ],
            options: [
                { name: 'url', type: 'string | fn', default: "OSM standard", desc: 'Template <code class="inline">{s}/{z}/{x}/{y}</code>, or a function of the tile.' },
                { name: 'subdomains', type: 'string[]', default: '[]', desc: 'Hosts to rotate <code class="inline">{s}</code> across (e.g. a, b, c).' },
                { name: 'opacity', type: 'number', default: '1', desc: 'Dim the imagery so overlaid data reads.' },
                { name: 'attribution', type: 'string | null', default: '"© OpenStreetMap contributors"', desc: 'Drawn bottom-right. A licence condition of every tile service — only pass null if you render the credit yourself.' },
                { name: 'zoomOffset / minZoom / maxZoom', type: 'number', default: '0 / 0 / 19', desc: 'Nudge or clamp the chosen zoom level (picked from the fitted scale).' },
            ],
            returns: 'A Feature emitting image nodes into the background layer, keyed by {z}/{x}/{y} so on-screen tiles survive a re-render without re-fetching.',
        },
        {
            name: 'geoPoint / geoPolygon / geoLine / geoText / geoRect',
            summary:
                'Editable overlays. Import from <code class="inline">vibe.plot</code>. ' +
                '<code class="inline">geoText</code> is <code class="inline">text</code> with the ' +
                'projection doing the placement — it shares the node shape, so ' +
                '<code class="inline">editText</code> / <code class="inline">cycle</code> / ' +
                '<code class="inline">rotate</code> work on it unchanged.',
            signatures: [
                'geoPoint({ channels: { lon, lat, size, fill }, edits }) → Feature',
                'geoPolygon({ channels: { geometry, fill } }) → Feature',
                'geoLine({ channels: { coordinates }, showVertices }) → Feature  // one line per row',
                'geoLine({ channels: { lon, lat }, order, series }) → Feature    // one path across rows',
                'geoText({ channels: { lon, lat, text }, dx, dy, format }) → Feature',
                'geoRect({ channels: { west, south, east, north } }) → Feature',
            ],
            channels: [
                { name: 'lon / lat', type: 'quantitative', desc: 'Position in degrees. One dot per row on geoPoint, the anchor on geoText; on geoLine, connects the rows into one path.' },
                { name: 'geometry', type: 'GeoJSON', desc: 'geoPolygon path geometry on each row.' },
                { name: 'coordinates', type: '[[lon,lat],…]', desc: 'geoLine vertex list (one line per row).' },
                { name: 'text', type: 'string', desc: 'geoText label content (raw, unscaled). Retype it with <code class="inline">editText()</code>.' },
                { name: 'fontSize / textAnchor / lineAnchor / angle', type: 'literal', desc: 'geoText glyph channels — same as the <code class="inline">text</code> mark.' },
                { name: 'dx / dy', type: 'px', desc: 'geoText visual nudge off the anchor (does not move the lon/lat a drag writes).' },
                { name: 'west/south/east/north', type: 'quantitative', desc: 'geoRect geographic AABB.' },
                { name: 'fill / stroke / size', type: 'style', desc: 'Ordinary style scales (not projected).' },
            ],
            returns: 'Features emitting path / circle / text / rect nodes in projected pixel space.',
        },
        {
            name: 'edit.geo.*',
            summary:
                'Geo-scoped edits (<code class="inline">scope: "geo"</code>). Invert the pointer ' +
                'through the chart projection.',
            signatures: [
                'edit.geo.drag() — move a geoPoint',
                'edit.geo.create() — click to place a lon/lat row',
                'edit.geo.draw() — drag to author a coordinates list',
                'edit.geo.dragVertex() — move a geoLine vertex handle',
                'edit.geo.brush({ move, edgeInset }) — resize/move a geoRect (geoBrush driver)',
                'edit.geo.createRect({ width, height }) — click open map to mint a bbox (degrees)',
            ],
        },
    ],
    sections: [
        {
            id: 'basemap',
            title: 'Providing basemap data',
            intro:
                'The basemap is chrome: pass GeoJSON into geoBasemap. Fit the projection ' +
                'with the same object as domain so the map fills the frame. Below, ' +
                '`vancouver` is the docs sample (22 local areas); your app would import or fetch its own.',
            examples: [
                {
                    title: 'Vancouver local areas',
                    blurb:
                        'Pass any FeatureCollection: geoBasemap({ geojson }). Fit with projection.domain. ' +
                        'In your app: const map = await fetch("…/my-map.geojson").then(r => r.json()).',
                    code:
`// docs inject \`vancouver\`; your app loads GeoJSON then passes it in:
// const vancouver = await fetch("data/vancouver-neighborhoods.json").then(r => r.json());

mount(Elicit({
  width: 520, height: 360,
  margins: { top: 8, right: 8, bottom: 8, left: 8 },
  projection: { type: "mercator", domain: vancouver, inset: 6 },
  data: [],
  schema: {},
  features: [
    geoBasemap({
      geojson: vancouver,
      fill: "#e8eef5",
      stroke: "#64748b",
      strokeWidth: 0.8,
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'tiles',
            title: 'Real basemaps (OSM raster tiles)',
            intro:
                'For an actual map under your data — streets, water, labels — use ' +
                '<code class="inline">geoTile()</code>: the Leaflet model, a pyramid of 256px ' +
                'images from a tile server, laid on the plane behind the marks. ' +
                '<b>It requires <code class="inline">projection: "mercator"</code></b> (unrotated). ' +
                'A tile is a pre-rendered picture baked in Web Mercator, so under any other ' +
                'projection it cannot be made to register with the data; the mark checks the ' +
                'projection\'s behaviour, draws nothing, and warns rather than showing you a ' +
                'misaligned map. Everything else is unchanged — the same lon/lat marks and the same ' +
                'edit.geo.* gestures ride on top, because they still go through the same projection. ' +
                '<b>Attribution is a licence condition</b> of every tile service and is drawn by ' +
                'default. Public OSM tiles are rate-limited and not meant for production traffic: ' +
                'point <code class="inline">url</code> at your own server or a paid provider when ' +
                'you ship.',
            examples: [
                {
                    title: 'Pins on OpenStreetMap',
                    blurb:
                        'geoTile() replaces geoBasemap entirely — no GeoJSON needed. The projection ' +
                        'still needs a domain to know where to look; a bbox works when you have no ' +
                        'topology to fit.',
                    try: '<b>Click</b> to drop a pin; <b>drag</b> it. Lon/lat come back as data.',
                    code:
`mount(Elicit({
  width: 520, height: 360,
  margins: { top: 8, right: 8, bottom: 8, left: 8 },
  // No GeoJSON: fit the projection to a lon/lat box. Mind the ring winding —
  // counterclockwise (RFC 7946). Reversed, d3 reads the box as the whole globe
  // and the map zooms out to the world.
  projection: {
    type: "mercator",
    domain: {
      type: "Polygon",
      coordinates: [[
        [-123.225, 49.198], [-123.225, 49.297],
        [-123.023, 49.297], [-123.023, 49.198], [-123.225, 49.198],
      ]],
    },
  },
  data: [
    { lon: -123.1207, lat: 49.2827, place: "Downtown" },
    { lon: -123.1560, lat: 49.2680, place: "Kitsilano" },
  ],
  schema: {
    lon:   { type: "quantitative", domain: [-123.27, -123.02] },
    lat:   { type: "quantitative", domain: [49.20, 49.32] },
    place: { type: "categorical" },
  },
  features: [
    geoTile(),   // defaults to OSM standard + its attribution

    geoPoint({
      size: 7, fill: "#dc2626", stroke: "#fff", strokeWidth: 2,
      channels: {
        lon: { field: "lon" },
        lat: { field: "lat" },
      },
      edits: [edit.geo.drag(), edit.geo.create({ defaults: { place: "new pin" } })],
    }),
  ],
}));`,
                },
                {
                    title: 'Tiles under the neighborhood outlines',
                    blurb:
                        'Raster and vector chrome compose: geoTile() lays the imagery, geoBasemap() ' +
                        'draws the boundaries over it (fill "none"), and the elicited marks sit on ' +
                        'top of both. Dim the tiles with opacity so your data still reads.',
                    try: '<b>Drag</b> a study box; <b>click</b> open map to add one.',
                    code:
`mount(Elicit({
  width: 520, height: 360,
  margins: { top: 8, right: 8, bottom: 8, left: 8 },
  projection: { type: "mercator", domain: vancouver, inset: 6 },
  data: [{ name: "study area", west: -123.140, south: 49.275, east: -123.100, north: 49.290 }],
  schema: {
    name:  { type: "categorical" },
    west:  { type: "quantitative", domain: [-123.27, -123.02] },
    south: { type: "quantitative", domain: [49.20, 49.32] },
    east:  { type: "quantitative", domain: [-123.27, -123.02] },
    north: { type: "quantitative", domain: [49.20, 49.32] },
  },
  features: [
    // A lighter, less busy basemap than OSM standard. Any {z}/{x}/{y} server works.
    geoTile({
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      subdomains: ["a", "b", "c"],
      opacity: 0.85,
      attribution: "© OpenStreetMap · © CARTO",
    }),

    // Vector boundaries on top of the imagery.
    geoBasemap({ geojson: vancouver, fill: "none", stroke: "#1e293b", strokeWidth: 0.8 }),

    geoRect({
      fill: "rgba(37, 99, 235, 0.18)", stroke: "#1d4ed8", strokeWidth: 1.5,
      channels: {
        west:  { field: "west" },
        south: { field: "south" },
        east:  { field: "east" },
        north: { field: "north" },
      },
      edits: [
        edit.geo.brush({ edgeInset: 10 }),
        edit.geo.createRect({ width: 0.024, height: 0.014, defaults: { name: "new area" } }),
      ],
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'points',
            title: 'Place / move points on the map',
            intro:
                'geoPoint overlays sit on the same projection. Click empty space to add; ' +
                'drag to move. Lon/lat come back through onChange / getData().',
            examples: [
                {
                    title: 'Belief pins on Vancouver',
                    blurb: 'Seeded near Downtown & Kitsilano; click elsewhere to add more.',
                    try: '<b>Click</b> to place a pin; <b>drag</b> an existing one.',
                    code:
`mount(Elicit({
  width: 520, height: 360,
  margins: { top: 8, right: 8, bottom: 8, left: 8 },
  projection: { type: "mercator", domain: vancouver, inset: 6 },
  data: [
    { lon: -123.1207, lat: 49.2827, label: "Downtown" },
    { lon: -123.1560, lat: 49.2680, label: "Kits" },
  ],
  schema: {
    lon: { type: "quantitative", domain: [-123.27, -123.02] },
    lat: { type: "quantitative", domain: [49.20, 49.32] },
    label: { type: "categorical" },
  },
  features: [
    geoBasemap({ geojson: vancouver, fill: "#e8eef5", stroke: "#64748b", strokeWidth: 0.8 }),
    geoPoint({
      size: 8, fill: "#1d4ed8", stroke: "#fff", strokeWidth: 1.5,
      channels: {
        lon: { field: "lon" },
        lat: { field: "lat" },
      },
      edits: [edit.geo.drag(), edit.geo.create()],
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'labels',
            title: 'Label and rename places',
            intro:
                'A label on a map is an ordinary <b>text</b> mark that happens to be positioned by ' +
                'the projection — so <code class="inline">geoText</code> is the only geo-specific ' +
                'part, and every text behaviour comes along free: ' +
                '<code class="inline">editText()</code> to retype the content, ' +
                '<code class="inline">cycle()</code> to advance a categorical label, ' +
                '<code class="inline">rotate()</code> on <code class="inline">angle</code>. ' +
                'Give it its own feature next to a geoPoint and the two read the same rows: ' +
                'drag the dot and the name follows. <code class="inline">dx</code>/' +
                '<code class="inline">dy</code> nudge the glyph off the anchor without touching the ' +
                'lon/lat a drag writes.',
            examples: [
                {
                    title: 'Named pins you can rename',
                    blurb:
                        'geoPoint carries the drag; geoText carries the label. editText() opens an ' +
                        'inline editor on double-click and writes the string back to the row.',
                    try:
                        '<b>Double-click</b> a name to retype it · <b>drag</b> a dot (the label ' +
                        'follows) · <b>click</b> the map to add a pin.',
                    code:
`mount(Elicit({
  width: 520, height: 360,
  margins: { top: 8, right: 8, bottom: 8, left: 8 },
  projection: { type: "mercator", domain: vancouver, inset: 6 },
  data: [
    { lon: -123.1207, lat: 49.2827, place: "Downtown" },
    { lon: -123.1560, lat: 49.2680, place: "Kitsilano" },
    { lon: -123.1000, lat: 49.2630, place: "Mt Pleasant" },
  ],
  schema: {
    lon:   { type: "quantitative", domain: [-123.27, -123.02] },
    lat:   { type: "quantitative", domain: [49.20, 49.32] },
    place: { type: "categorical" },
  },
  features: [
    geoBasemap({ geojson: vancouver, fill: "#eef2f7", stroke: "#94a3b8", strokeWidth: 0.7 }),

    geoPoint({
      size: 6, fill: "#0f766e", stroke: "#fff", strokeWidth: 1.5,
      channels: {
        lon: { field: "lon" },
        lat: { field: "lat" },
      },
      edits: [edit.geo.drag(), edit.geo.create({ defaults: { place: "new place" } })],
    }),

    // The label: same rows, positioned by the same projection, nudged above the dot.
    geoText({
      dy: -12, fontSize: 12, fill: "#0f172a",
      channels: {
        lon:  { field: "lon" },
        lat:  { field: "lat" },
        text: { field: "place" },
      },
      edits: [editText({ channel: "text" })],
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'polygons',
            title: 'Recolor neighborhoods',
            intro:
                'Editable regions are dataset rows with a geometry field — a subset of the ' +
                'basemap features promoted into data. The basemap stays inert chrome underneath.',
            examples: [
                {
                    title: 'Cycle fill on selected local areas',
                    blurb: 'Kitsilano, Fairview, Mount Pleasant, Downtown — click to cycle category.',
                    try: '<b>Click</b> a shaded neighborhood to cycle its colour.',
                    code:
`const editable = vancouver.features
  .filter(f => ["Kitsilano", "Fairview", "Mount Pleasant", "Downtown"].includes(f.properties.name))
  .map(f => ({
    name: f.properties.name,
    geometry: f.geometry,
    fill: "A",
  }));

mount(Elicit({
  width: 520, height: 360,
  margins: { top: 8, right: 8, bottom: 8, left: 8 },
  projection: { type: "mercator", domain: vancouver, inset: 6 },
  data: editable,
  schema: {
    name: { type: "categorical" },
    fill: { type: "categorical", domain: ["A", "B", "C"] },
    geometry: { type: "categorical" },
  },
  features: [
    geoBasemap({ geojson: vancouver, fill: "#f1f5f9", stroke: "#94a3b8", strokeWidth: 0.7 }),
    geoPolygon({
      stroke: "#0f172a", strokeWidth: 1.2, fillOpacity: 0.75,
      channels: {
        geometry: { field: "geometry", scale: null },
        fill: {
          field: "fill",
          scale: { scheme: "tableau10" },
          edit: cycle(),
        },
      },
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'lines',
            title: 'Draw lines over the city',
            intro:
                'Author a route as [lon, lat] pairs on top of the neighborhoods. ' +
                'Vertex reshape uses edit.geo.dragVertex on a seeded line (keep draw and ' +
                'vertex-drag on separate charts — draw raises the plane above marks).',
            examples: [
                {
                    title: 'Draw a path across Vancouver',
                    try: '<b>Drag</b> across the map to sketch a route.',
                    code:
`mount(Elicit({
  width: 520, height: 360,
  margins: { top: 8, right: 8, bottom: 8, left: 8 },
  projection: { type: "mercator", domain: vancouver, inset: 6 },
  data: [],
  schema: {
    coordinates: { type: "categorical" },
  },
  features: [
    geoBasemap({ geojson: vancouver, fill: "#e8eef5", stroke: "#64748b", strokeWidth: 0.8 }),
    geoLine({
      stroke: "#b91c1c", strokeWidth: 2.5, showVertices: true, handleSize: 4,
      channels: {
        coordinates: { field: "coordinates", scale: null },
      },
      edits: [edit.geo.draw()],
    }),
  ],
}));`,
                },
                {
                    title: 'Reshape a seeded Broadway-ish line',
                    blurb: 'Drag vertex handles on a pre-drawn path.',
                    try: '<b>Drag</b> a vertex handle.',
                    code:
`mount(Elicit({
  width: 520, height: 360,
  margins: { top: 8, right: 8, bottom: 8, left: 8 },
  projection: { type: "mercator", domain: vancouver, inset: 6 },
  data: [{
    coordinates: [
      [-123.185, 49.264],
      [-123.155, 49.263],
      [-123.120, 49.263],
      [-123.080, 49.262],
      [-123.050, 49.261],
    ],
  }],
  schema: {
    coordinates: { type: "categorical" },
  },
  features: [
    geoBasemap({ geojson: vancouver, fill: "#e8eef5", stroke: "#64748b", strokeWidth: 0.8 }),
    geoLine({
      stroke: "#b91c1c", strokeWidth: 2.5, handleSize: 6,
      channels: {
        coordinates: { field: "coordinates", scale: null },
      },
      edits: [edit.geo.dragVertex()],
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'connected',
            title: 'Connected scatter over the map',
            intro:
                'Give geoLine <code class="inline">lon</code>/<code class="inline">lat</code> channels ' +
                'instead of <code class="inline">coordinates</code> and it connects the dataset\'s ' +
                '<b>rows</b> into one path — the geographic sibling of the ' +
                '<code class="inline">path</code> mark. Points ride on a separate geoPoint feature, so ' +
                'dragging a stop reshapes the trail: the line re-derives from the same rows on the ' +
                'next render. Order defaults to <code class="inline">"sequence"</code> (array order); ' +
                'pass a field name to sort by it, or <code class="inline">series</code> to draw one ' +
                'trail per group.',
            examples: [
                {
                    title: 'A route across Vancouver',
                    blurb:
                        'Five stops connected in `stop` order. The dots are a geoPoint mark with ' +
                        'edit.geo.drag() — the trail follows because both marks read the same dataset.',
                    try: '<b>Drag</b> a stop to reroute; <b>click</b> the map to append one.',
                    code:
`mount(Elicit({
  width: 520, height: 360,
  margins: { top: 8, right: 8, bottom: 8, left: 8 },
  projection: { type: "mercator", domain: vancouver, inset: 6 },
  data: [
    { stop: 1, lon: -123.1850, lat: 49.2720, place: "Kitsilano" },
    { stop: 2, lon: -123.1480, lat: 49.2660, place: "Fairview" },
    { stop: 3, lon: -123.1150, lat: 49.2640, place: "Mount Pleasant" },
    { stop: 4, lon: -123.1000, lat: 49.2790, place: "Strathcona" },
    { stop: 5, lon: -123.1207, lat: 49.2870, place: "Downtown" },
  ],
  schema: {
    stop:  { type: "quantitative" },
    lon:   { type: "quantitative", domain: [-123.27, -123.02] },
    lat:   { type: "quantitative", domain: [49.20, 49.32] },
    place: { type: "categorical" },
  },
  features: [
    geoBasemap({ geojson: vancouver, fill: "#eef2f7", stroke: "#94a3b8", strokeWidth: 0.7 }),

    // The connector: lon/lat channels -> one path across the rows, in \`stop\` order.
    geoLine({
      stroke: "#b91c1c", strokeWidth: 2, order: "stop", curve: "linear",
      channels: {
        lon: { field: "lon" },
        lat: { field: "lat" },
      },
    }),

    // The stops: their own feature, so a drag lands on one dot.
    geoPoint({
      size: 6, fill: "#b91c1c", stroke: "#fff", strokeWidth: 1.5,
      channels: {
        lon: { field: "lon" },
        lat: { field: "lat" },
      },
      edits: [edit.geo.drag(), edit.geo.create({ defaults: { place: "new stop" } })],
    }),
  ],
}));`,
                },
            ],
        },
        {
            id: 'rects',
            title: 'Geographic rectangles',
            intro:
                'Boxes are axis-aligned in lon/lat (they may look slightly curved under Mercator). ' +
                'Grab an <b>edge</b> or <b>corner</b> to reshape, the <b>body</b> to move, and click ' +
                'empty space to mint another. The zone you grabbed is latched at dragstart by the ' +
                '<code class="inline">geoBrush</code> driver and held for the whole gesture, so a move ' +
                'never turns into a resize halfway through; the cursor tells you which zone you\'re in ' +
                'before you press.',
            examples: [
                {
                    title: 'Study areas over the city',
                    blurb:
                        'edit.geo.brush() resizes + moves; edit.geo.createRect() mints a new box on a ' +
                        'click in open space (clicking an existing box grabs it instead). ' +
                        'Pass move:false for resize-only, or { edgeInset } to widen the grab band.',
                    try:
                        '<b>Drag</b> a corner or edge to reshape · <b>drag</b> the middle to move · ' +
                        '<b>click</b> empty map to add a box.',
                    code:
`mount(Elicit({
  width: 520, height: 360,
  margins: { top: 8, right: 8, bottom: 8, left: 8 },
  projection: { type: "mercator", domain: vancouver, inset: 6 },
  data: [
    { name: "downtown",  west: -123.140, south: 49.275, east: -123.100, north: 49.290 },
    { name: "west side", west: -123.185, south: 49.245, east: -123.150, north: 49.262 },
  ],
  schema: {
    name:  { type: "categorical" },
    west:  { type: "quantitative", domain: [-123.27, -123.02] },
    south: { type: "quantitative", domain: [49.20, 49.32] },
    east:  { type: "quantitative", domain: [-123.27, -123.02] },
    north: { type: "quantitative", domain: [49.20, 49.32] },
  },
  features: [
    geoBasemap({ geojson: vancouver, fill: "#eef2f7", stroke: "#94a3b8", strokeWidth: 0.7 }),
    geoRect({
      fill: "rgba(37, 99, 235, 0.18)", stroke: "#1d4ed8", strokeWidth: 1.5,
      channels: {
        west:  { field: "west" },
        south: { field: "south" },
        east:  { field: "east" },
        north: { field: "north" },
      },
      edits: [
        edit.geo.brush({ edgeInset: 10 }),
        edit.geo.createRect({ width: 0.024, height: 0.014, defaults: { name: "new area" } }),
      ],
    }),
  ],
}));`,
                },
            ],
        },
    ],
};
