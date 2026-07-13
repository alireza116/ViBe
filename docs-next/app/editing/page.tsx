import { DocPageView } from '../../components/DocPageView';
import page from '../../content/editing';
import { meta as ex0Meta, code as ex0Code } from '../../examples/editing/drag-a-value-bars';
import { meta as ex1Meta, code as ex1Code } from '../../examples/editing/nearest-pick-from-empty-space';

const examples = {
  'editing/drag-a-value-bars': { meta: ex0Meta, code: ex0Code },
  'editing/nearest-pick-from-empty-space': { meta: ex1Meta, code: ex1Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
