import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-line';
import { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-line/curve-catmullrom';
import { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-line/sweep-to-draw-the-curve';
import { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-line/a-clean-line-still-sweepable';
import { meta as ex3Meta, code as ex3Code } from '../../../examples/marks-line/two-series-swept-independently';
import { meta as ex4Meta, code as ex4Code } from '../../../examples/marks-line/a-2d-path-you-can-reshape';
import { meta as ex5Meta, code as ex5Code } from '../../../examples/marks-line/double-click-to-seed-then-sweep';
import { meta as ex6Meta, code as ex6Code } from '../../../examples/marks-line/draw-then-reshape';

const examples = {
  'marks-line/curve-catmullrom': { meta: ex0Meta, code: ex0Code },
  'marks-line/sweep-to-draw-the-curve': { meta: ex1Meta, code: ex1Code },
  'marks-line/a-clean-line-still-sweepable': { meta: ex2Meta, code: ex2Code },
  'marks-line/two-series-swept-independently': { meta: ex3Meta, code: ex3Code },
  'marks-line/a-2d-path-you-can-reshape': { meta: ex4Meta, code: ex4Code },
  'marks-line/double-click-to-seed-then-sweep': { meta: ex5Meta, code: ex5Code },
  'marks-line/draw-then-reshape': { meta: ex6Meta, code: ex6Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
