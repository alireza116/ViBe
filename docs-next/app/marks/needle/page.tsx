import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-needle';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-needle/quantitative-gauge';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-needle/right-facing-orient-right';
import Ex2, { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-needle/small-needles-in-a-scatter-of-pivots';
import Ex3, { meta as ex3Meta, code as ex3Code } from '../../../examples/marks-needle/quantitative-dial';
import Ex4, { meta as ex4Meta, code as ex4Code } from '../../../examples/marks-needle/likelihood-gauge';

const examples = {
  'marks-needle/quantitative-gauge': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'marks-needle/right-facing-orient-right': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
  'marks-needle/small-needles-in-a-scatter-of-pivots': { meta: ex2Meta, code: ex2Code, Component: Ex2 },
  'marks-needle/quantitative-dial': { meta: ex3Meta, code: ex3Code, Component: Ex3 },
  'marks-needle/likelihood-gauge': { meta: ex4Meta, code: ex4Code, Component: Ex4 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
