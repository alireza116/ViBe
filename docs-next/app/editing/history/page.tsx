import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/editing-history';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/editing-history/undo-a-drag';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../../examples/editing-history/keyboard-nudge';

const examples = {
  'editing-history/undo-a-drag': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'editing-history/keyboard-nudge': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
