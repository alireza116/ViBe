import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-point';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-point/sequential-fill-size-from-a-number';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-point/constant-style-shorthands';
import Ex2, { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-point/2d-move-scatter';

const examples = {
  'marks-point/sequential-fill-size-from-a-number': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'marks-point/constant-style-shorthands': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
  'marks-point/2d-move-scatter': { meta: ex2Meta, code: ex2Code, Component: Ex2 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
