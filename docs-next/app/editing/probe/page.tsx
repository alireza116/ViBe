import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/editing-probe';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/editing-probe/line-then-cone';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../../examples/editing-probe/probe-a-single-value';
import Ex2, { meta as ex2Meta, code as ex2Code } from '../../../examples/editing-probe/a-tentative-token';

const examples = {
  'editing-probe/line-then-cone': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'editing-probe/probe-a-single-value': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
  'editing-probe/a-tentative-token': { meta: ex2Meta, code: ex2Code, Component: Ex2 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
