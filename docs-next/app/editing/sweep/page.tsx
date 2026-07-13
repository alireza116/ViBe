import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/editing-sweep';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/editing-sweep/draw-a-curve';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../../examples/editing-sweep/two-lines-swept-independently';

const examples = {
  'editing-sweep/draw-a-curve': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'editing-sweep/two-lines-swept-independently': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
