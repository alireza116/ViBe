import type { DocPage } from '../lib/types';

const page: DocPage = {
  "route": "/guides",
  "title": "Guides",
  "lead": "A guide is a graphical mark that isn’t bound to a row the way a plot mark is: it draws an annotation. But it is still allowed to <b>depend on the data</b> — every guide option may be a literal <i>or</i> a function of the guide context (<code class=\"inline\">{ data, scales, features, ui, width, height, stage }</code>), so a mean line is one line of spec. Guides rebuild every render and never capture a gesture. <code class=\"inline\">guides.rule</code> draws a reference line at a data value, <code class=\"inline\">guides.region</code> shades a band between two values, and <code class=\"inline\">guides.proximity</code> visualizes what a nearest-pick edit has selected. (An edit’s own constraint bounds draw automatically via <code class=\"inline\">guide: true</code>.)",
  "api": [
    {
      "name": "guides.rule · guides.region · guides.proximity · guides.legend",
      "summary": "Import from <code class=\"inline\">vibe.guides</code> and pass in the chart’s <code class=\"inline\">guides: [...]</code>. All position in <b>data space</b> through the same <code class=\"inline\">scale.encode()</code> a mark uses, so they compose across scale types. Non-interactive.",
      "signatures": [
        "guides.rule({ x?, y?, stroke, strokeDasharray, label }) → Guide",
        "guides.region({ x?, y?, fill, opacity }) → Guide",
        "guides.proximity({ target, color }) → Guide",
        "guides.legend({ channel, x, y, size, gap, columns }) → Guide",
        "guides.custom((ctx) => FeatureNode[]) → Guide",
        "",
        "// any option may be a function of the guide context:",
        "guides.rule({ y: ({ data }) => d3.mean(data, (d) => d.y), label: \"mean\" })"
      ],
      "options": [
        {
          "name": "rule.x / y",
          "type": "any | (ctx) => any",
          "default": "—",
          "desc": "The value to draw the reference line at (a number, a category, or a function of the data)."
        },
        {
          "name": "rule.label",
          "type": "string | (ctx) => string",
          "default": "—",
          "desc": "Optional text label near the line."
        },
        {
          "name": "rule.stroke / strokeDasharray",
          "type": "style",
          "default": "#64748b / '5 4'",
          "desc": "Line colour and dash pattern."
        },
        {
          "name": "region.x / y",
          "type": "[a, b] | (ctx) => [a, b]",
          "default": "—",
          "desc": "The two values to shade between on that axis."
        },
        {
          "name": "region.fill / opacity",
          "type": "style",
          "default": "#64748b / 0.1",
          "desc": "Band fill and opacity."
        },
        {
          "name": "proximity.target",
          "type": "string",
          "default": "—",
          "desc": "The feature id whose nearest-pick selection to visualize (ring + highlight)."
        },
        {
          "name": "proximity.color",
          "type": "string",
          "default": "effect",
          "desc": "Override the highlight colour (else the effects layer’s)."
        },
        {
          "name": "legend.channel",
          "type": "string",
          "default": "'fill'",
          "desc": "Discrete channel whose domain becomes swatches. Pair with <code class=\"inline\">edit.legend</code> using the same layout."
        }
      ],
      "returns": "Each returns a <b>Guide</b> (<code class=\"inline\">{ isGuide: true, build(ctx) }</code>), rebuilt every render so it tracks live data."
    }
  ],
  "sections": [
    {
      "id": "annotations",
      "title": "Rule & region",
      "intro": "A shaded target band (region) and a reference line (rule) annotate a chart. They sit under the marks and follow the same scales, so they stay put as points move.",
      "examples": [
        "guides/a-target-band-with-a-rule"
      ]
    },
    {
      "id": "live",
      "title": "Guides derived from the data",
      "intro": "A guide option can be a function of the guide context, so an annotation can be computed from the rows it annotates. Here one rule is a fixed target and the other is the running <b>mean</b> — recomputed on every commit, because guides rebuild each render. The band tracks the spread the same way.",
      "examples": [
        "guides/a-mean-line-that-chases-the-bars"
      ]
    }
  ]
};

export default page;
