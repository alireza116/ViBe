import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/editing-sweep';
import { meta as ex0Meta, code as ex0Code } from '../../../examples/editing-sweep/draw-a-curve';
import { meta as ex1Meta, code as ex1Code } from '../../../examples/editing-sweep/two-lines-swept-independently';

const examples = {
  'editing-sweep/draw-a-curve': { meta: ex0Meta, code: ex0Code },
  'editing-sweep/two-lines-swept-independently': { meta: ex1Meta, code: ex1Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
