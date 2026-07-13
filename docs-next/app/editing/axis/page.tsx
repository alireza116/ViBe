import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/editing-axis';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/editing-axis/rescale-in-place';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../../examples/editing-axis/grow-the-chart-instead';
import Ex2, { meta as ex2Meta, code as ex2Code } from '../../../examples/editing-axis/edit-the-category-list';
import Ex3, { meta as ex3Meta, code as ex3Code } from '../../../examples/editing-axis/grow-a-likert-scale';

const examples = {
  'editing-axis/rescale-in-place': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'editing-axis/grow-the-chart-instead': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
  'editing-axis/edit-the-category-list': { meta: ex2Meta, code: ex2Code, Component: Ex2 },
  'editing-axis/grow-a-likert-scale': { meta: ex3Meta, code: ex3Code, Component: Ex3 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
