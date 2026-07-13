import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-line';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-line/curve-catmullrom';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-line/sweep-to-draw-the-curve';
import Ex2, { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-line/a-clean-line-still-sweepable';
import Ex3, { meta as ex3Meta, code as ex3Code } from '../../../examples/marks-line/two-series-swept-independently';
import Ex4, { meta as ex4Meta, code as ex4Code } from '../../../examples/marks-line/a-2d-path-you-can-reshape';
import Ex5, { meta as ex5Meta, code as ex5Code } from '../../../examples/marks-line/double-click-to-seed-then-sweep';
import Ex6, { meta as ex6Meta, code as ex6Code } from '../../../examples/marks-line/draw-then-reshape';

const examples = {
  'marks-line/curve-catmullrom': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'marks-line/sweep-to-draw-the-curve': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
  'marks-line/a-clean-line-still-sweepable': { meta: ex2Meta, code: ex2Code, Component: Ex2 },
  'marks-line/two-series-swept-independently': { meta: ex3Meta, code: ex3Code, Component: Ex3 },
  'marks-line/a-2d-path-you-can-reshape': { meta: ex4Meta, code: ex4Code, Component: Ex4 },
  'marks-line/double-click-to-seed-then-sweep': { meta: ex5Meta, code: ex5Code, Component: Ex5 },
  'marks-line/draw-then-reshape': { meta: ex6Meta, code: ex6Code, Component: Ex6 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
