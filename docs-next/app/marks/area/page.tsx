import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-area';
import { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-area/editable-area';

const examples = {
  'marks-area/editable-area': { meta: ex0Meta, code: ex0Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
