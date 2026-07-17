import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-composite';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-composite/one-editable-field-the-tip';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-composite/independent-handles-per-field';
import Ex2, { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-composite/coupled-move-center-within-ends';
import Ex3, { meta as ex3Meta, code as ex3Code } from '../../../examples/marks-composite/composite-channels-trickle-down';
import Ex4, { meta as ex4Meta, code as ex4Code } from '../../../examples/marks-composite/hub-point-own-fill-size';

const examples = {
  'marks-composite/one-editable-field-the-tip': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'marks-composite/independent-handles-per-field': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
  'marks-composite/coupled-move-center-within-ends': { meta: ex2Meta, code: ex2Code, Component: Ex2 },
  'marks-composite/composite-channels-trickle-down': { meta: ex3Meta, code: ex3Code, Component: Ex3 },
  'marks-composite/hub-point-own-fill-size': { meta: ex4Meta, code: ex4Code, Component: Ex4 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
