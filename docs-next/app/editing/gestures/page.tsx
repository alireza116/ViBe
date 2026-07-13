import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/editing-gestures';
import { meta as ex0Meta, code as ex0Code } from '../../../examples/editing-gestures/drag-outward-to-grow';
import { meta as ex1Meta, code as ex1Code } from '../../../examples/editing-gestures/move-shift-resize-click-cycle';
import { meta as ex2Meta, code as ex2Code } from '../../../examples/editing-gestures/invert-y-yourself';

const examples = {
  'editing-gestures/drag-outward-to-grow': { meta: ex0Meta, code: ex0Code },
  'editing-gestures/move-shift-resize-click-cycle': { meta: ex1Meta, code: ex1Code },
  'editing-gestures/invert-y-yourself': { meta: ex2Meta, code: ex2Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
