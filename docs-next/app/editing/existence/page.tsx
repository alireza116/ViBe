import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/editing-existence';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/editing-existence/click-to-add-a-point';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../../examples/editing-existence/existence-move-on-one-mark';
import Ex2, { meta as ex2Meta, code as ex2Code } from '../../../examples/editing-existence/arbitration-click-recolours-alt-click-deletes';
import Ex3, { meta as ex3Meta, code as ex3Code } from '../../../examples/editing-existence/click-to-add-an-anchor';
import Ex4, { meta as ex4Meta, code as ex4Code } from '../../../examples/editing-existence/seed-a-whole-line-newseries';
import Ex5, { meta as ex5Meta, code as ex5Code } from '../../../examples/editing-existence/freehand-draw-a-path-as-you-drag';
import Ex6, { meta as ex6Meta, code as ex6Code } from '../../../examples/editing-existence/remove-a-whole-line';

const examples = {
  'editing-existence/click-to-add-a-point': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'editing-existence/existence-move-on-one-mark': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
  'editing-existence/arbitration-click-recolours-alt-click-deletes': { meta: ex2Meta, code: ex2Code, Component: Ex2 },
  'editing-existence/click-to-add-an-anchor': { meta: ex3Meta, code: ex3Code, Component: Ex3 },
  'editing-existence/seed-a-whole-line-newseries': { meta: ex4Meta, code: ex4Code, Component: Ex4 },
  'editing-existence/freehand-draw-a-path-as-you-drag': { meta: ex5Meta, code: ex5Code, Component: Ex5 },
  'editing-existence/remove-a-whole-line': { meta: ex6Meta, code: ex6Code, Component: Ex6 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
