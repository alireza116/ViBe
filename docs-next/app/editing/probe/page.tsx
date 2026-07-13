import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/editing-probe';
import { meta as ex0Meta, code as ex0Code } from '../../../examples/editing-probe/line-then-cone';
import { meta as ex1Meta, code as ex1Code } from '../../../examples/editing-probe/probe-a-single-value';
import { meta as ex2Meta, code as ex2Code } from '../../../examples/editing-probe/a-tentative-token';

const examples = {
  'editing-probe/line-then-cone': { meta: ex0Meta, code: ex0Code },
  'editing-probe/probe-a-single-value': { meta: ex1Meta, code: ex1Code },
  'editing-probe/a-tentative-token': { meta: ex2Meta, code: ex2Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
