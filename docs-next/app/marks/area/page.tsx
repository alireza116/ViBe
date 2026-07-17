import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-area';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-area/editable-area';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-area/an-editable-confidence-band';

const examples = {
  'marks-area/editable-area': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'marks-area/an-editable-confidence-band': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
