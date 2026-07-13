import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/editing-stages';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/editing-stages/two-stage-point';

const examples = {
  'editing-stages/two-stage-point': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
