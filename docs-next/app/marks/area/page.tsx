import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-area';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-area/editable-area';

const examples = {
  'marks-area/editable-area': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
