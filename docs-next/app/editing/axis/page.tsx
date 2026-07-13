import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/editing-axis';
import { meta as ex0Meta, code as ex0Code } from '../../../examples/editing-axis/rescale-in-place';
import { meta as ex1Meta, code as ex1Code } from '../../../examples/editing-axis/grow-the-chart-instead';
import { meta as ex2Meta, code as ex2Code } from '../../../examples/editing-axis/edit-the-category-list';
import { meta as ex3Meta, code as ex3Code } from '../../../examples/editing-axis/grow-a-likert-scale';

const examples = {
  'editing-axis/rescale-in-place': { meta: ex0Meta, code: ex0Code },
  'editing-axis/grow-the-chart-instead': { meta: ex1Meta, code: ex1Code },
  'editing-axis/edit-the-category-list': { meta: ex2Meta, code: ex2Code },
  'editing-axis/grow-a-likert-scale': { meta: ex3Meta, code: ex3Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
