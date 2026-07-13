import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/editing-existence';
import { meta as ex0Meta, code as ex0Code } from '../../../examples/editing-existence/click-to-add-a-point';
import { meta as ex1Meta, code as ex1Code } from '../../../examples/editing-existence/existence-move-on-one-mark';
import { meta as ex2Meta, code as ex2Code } from '../../../examples/editing-existence/arbitration-click-recolours-alt-click-deletes';
import { meta as ex3Meta, code as ex3Code } from '../../../examples/editing-existence/click-to-add-an-anchor';
import { meta as ex4Meta, code as ex4Code } from '../../../examples/editing-existence/seed-a-whole-line-newseries';
import { meta as ex5Meta, code as ex5Code } from '../../../examples/editing-existence/freehand-draw-a-path-as-you-drag';
import { meta as ex6Meta, code as ex6Code } from '../../../examples/editing-existence/remove-a-whole-line';

const examples = {
  'editing-existence/click-to-add-a-point': { meta: ex0Meta, code: ex0Code },
  'editing-existence/existence-move-on-one-mark': { meta: ex1Meta, code: ex1Code },
  'editing-existence/arbitration-click-recolours-alt-click-deletes': { meta: ex2Meta, code: ex2Code },
  'editing-existence/click-to-add-an-anchor': { meta: ex3Meta, code: ex3Code },
  'editing-existence/seed-a-whole-line-newseries': { meta: ex4Meta, code: ex4Code },
  'editing-existence/freehand-draw-a-path-as-you-drag': { meta: ex5Meta, code: ex5Code },
  'editing-existence/remove-a-whole-line': { meta: ex6Meta, code: ex6Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
