import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-text';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-text/a-labelled-scatter';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-text/formatted-numeric-labels';
import Ex2, { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-text/line-chart-with-value-labels';
import Ex3, { meta as ex3Meta, code as ex3Code } from '../../../examples/marks-text/drag-to-reposition';
import Ex4, { meta as ex4Meta, code as ex4Code } from '../../../examples/marks-text/draggable-numeric-readout';
import Ex5, { meta as ex5Meta, code as ex5Code } from '../../../examples/marks-text/type-to-edit-content';
import Ex6, { meta as ex6Meta, code as ex6Code } from '../../../examples/marks-text/drag-and-retype-together';

const examples = {
  'marks-text/a-labelled-scatter': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'marks-text/formatted-numeric-labels': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
  'marks-text/line-chart-with-value-labels': { meta: ex2Meta, code: ex2Code, Component: Ex2 },
  'marks-text/drag-to-reposition': { meta: ex3Meta, code: ex3Code, Component: Ex3 },
  'marks-text/draggable-numeric-readout': { meta: ex4Meta, code: ex4Code, Component: Ex4 },
  'marks-text/type-to-edit-content': { meta: ex5Meta, code: ex5Code, Component: Ex5 },
  'marks-text/drag-and-retype-together': { meta: ex6Meta, code: ex6Code, Component: Ex6 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
