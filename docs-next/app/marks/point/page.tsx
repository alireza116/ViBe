import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-point';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-point/sequential-fill-size-from-a-number';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-point/constant-style-shorthands';
import Ex2, { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-point/2d-move-scatter';
import Ex3, { meta as ex3Meta, code as ex3Code } from '../../../examples/marks-point/scatter-of-rotatable-squares';
import Ex4, { meta as ex4Meta, code as ex4Code } from '../../../examples/marks-point/scatter-of-rotatable-ticks';

const examples = {
  'marks-point/sequential-fill-size-from-a-number': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'marks-point/constant-style-shorthands': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
  'marks-point/2d-move-scatter': { meta: ex2Meta, code: ex2Code, Component: Ex2 },
  'marks-point/scatter-of-rotatable-squares': { meta: ex3Meta, code: ex3Code, Component: Ex3 },
  'marks-point/scatter-of-rotatable-ticks': { meta: ex4Meta, code: ex4Code, Component: Ex4 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
