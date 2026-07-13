import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-composite';
import { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-composite/one-editable-field-the-tip';
import { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-composite/independent-handles-per-field';
import { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-composite/coupled-move-center-within-ends';

const examples = {
  'marks-composite/one-editable-field-the-tip': { meta: ex0Meta, code: ex0Code },
  'marks-composite/independent-handles-per-field': { meta: ex1Meta, code: ex1Code },
  'marks-composite/coupled-move-center-within-ends': { meta: ex2Meta, code: ex2Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
