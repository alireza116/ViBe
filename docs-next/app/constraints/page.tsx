import { DocPageView } from '../../components/DocPageView';
import page from '../../content/constraints';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../examples/constraints/bars-that-compensate';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../examples/constraints/clamped-drag-with-a-guide';
import Ex2, { meta as ex2Meta, code as ex2Code } from '../../examples/constraints/one-bar-per-category';
import Ex3, { meta as ex3Meta, code as ex3Code } from '../../examples/constraints/composite-key-a-band-band-grid';
import Ex4, { meta as ex4Meta, code as ex4Code } from '../../examples/constraints/an-interval-that-stays-in-order';
import Ex5, { meta as ex5Meta, code as ex5Code } from '../../examples/constraints/a-curve-that-only-rises';
import Ex6, { meta as ex6Meta, code as ex6Code } from '../../examples/constraints/thresholds-that-stay-apart';

const examples = {
  'constraints/bars-that-compensate': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'constraints/clamped-drag-with-a-guide': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
  'constraints/one-bar-per-category': { meta: ex2Meta, code: ex2Code, Component: Ex2 },
  'constraints/composite-key-a-band-band-grid': { meta: ex3Meta, code: ex3Code, Component: Ex3 },
  'constraints/an-interval-that-stays-in-order': { meta: ex4Meta, code: ex4Code, Component: Ex4 },
  'constraints/a-curve-that-only-rises': { meta: ex5Meta, code: ex5Code, Component: Ex5 },
  'constraints/thresholds-that-stay-apart': { meta: ex6Meta, code: ex6Code, Component: Ex6 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
