import { DocPageView } from '../../components/DocPageView';
import page from '../../content/sizing';
import { meta as ex0Meta, code as ex0Code } from '../../examples/sizing/fills-the-parent-width';
import { meta as ex1Meta, code as ex1Code } from '../../examples/sizing/redraws-to-the-parent-width';
import { meta as ex2Meta, code as ex2Code } from '../../examples/sizing/exact-pixels';

const examples = {
  'sizing/fills-the-parent-width': { meta: ex0Meta, code: ex0Code },
  'sizing/redraws-to-the-parent-width': { meta: ex1Meta, code: ex1Code },
  'sizing/exact-pixels': { meta: ex2Meta, code: ex2Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
