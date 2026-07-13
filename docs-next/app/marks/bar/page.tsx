import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-bar';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-bar/a-vertical-bar-chart';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-bar/colour-by-a-field';
import Ex2, { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-bar/barx-value-on-x';
import Ex3, { meta as ex3Meta, code as ex3Code } from '../../../examples/marks-bar/years-active-per-person';
import Ex4, { meta as ex4Meta, code as ex4Code } from '../../../examples/marks-bar/brush-edges-body-together';
import Ex5, { meta as ex5Meta, code as ex5Code } from '../../../examples/marks-bar/drag-a-value';
import Ex6, { meta as ex6Meta, code as ex6Code } from '../../../examples/marks-bar/nearest-pick-self-drawn-guide';

const examples = {
  'marks-bar/a-vertical-bar-chart': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'marks-bar/colour-by-a-field': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
  'marks-bar/barx-value-on-x': { meta: ex2Meta, code: ex2Code, Component: Ex2 },
  'marks-bar/years-active-per-person': { meta: ex3Meta, code: ex3Code, Component: Ex3 },
  'marks-bar/brush-edges-body-together': { meta: ex4Meta, code: ex4Code, Component: Ex4 },
  'marks-bar/drag-a-value': { meta: ex5Meta, code: ex5Code, Component: Ex5 },
  'marks-bar/nearest-pick-self-drawn-guide': { meta: ex6Meta, code: ex6Code, Component: Ex6 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
