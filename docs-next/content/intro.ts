import type { DocPage } from '../lib/types';

const page: DocPage = {
  route: '/',
  title: 'What you can elicit',
  lead:
    'VibeJS lets you build charts people can answer with — drag a bar, place a point, turn a dial — and you get structured data back (see the panel next to each chart). Try the questions below.',
  sections: [
    {
      id: 'allocate',
      title: 'How would you allocate 100% across these categories?',
      intro:
        'Use a bar chart when the pieces have to add up. Drag any bar; the others adjust so the total stays 100.',
      codeMode: 'collapsed',
      examples: ['intro/allocate-a-budget'],
    },
    {
      id: 'scatter',
      title: 'Where do people sit on age vs immigration attitude?',
      intro:
        'Use a scatter plot to ask a two-part question. The chart starts empty — double-click to add someone, then drag them into place.',
      codeMode: 'collapsed',
      examples: ['intro/place-beliefs'],
    },
    {
      id: 'forecast',
      title: 'What trend do you expect over time?',
      intro:
        'Use a line chart when you want someone to draw a path. Drag across the chart to sketch the forecast you have in mind.',
      codeMode: 'collapsed',
      examples: ['intro/draw-a-forecast'],
    },
    {
      id: 'needle',
      title: 'How likely is Candidate D to win?',
      intro:
        'Use a needle dial for a single choice on a scale — from “very likely D” to “very likely R.” Drag the needle to answer.',
      codeMode: 'collapsed',
      examples: ['intro/likelihood-needle'],
    },
    {
      id: 'geo',
      title: 'Where do you think is the best place to live in Vancouver?',
      intro:
        'Place pins on a map to answer. Click to drop a pin; drag one to move it.',
      codeMode: 'collapsed',
      examples: ['intro/pins-on-a-map'],
    },
    {
      id: 'survey',
      title: 'How easy is this tool to use?',
      intro:
        'Classic survey scales work too. Hover to preview, then click to lock in an answer.',
      codeMode: 'collapsed',
      examples: ['intro/answer-a-scale'],
    },
    {
      id: 'anatomy',
      title: 'How a chart is built',
      intro:
        'Under the hood it’s a short recipe: starting data, what each field means, and a chart type with dragging turned on. The panel on the right is the answer you collect.',
      codeMode: 'readonly',
      examples: ['intro/how-a-chart-is-built'],
    },
  ],
};

export default page;
