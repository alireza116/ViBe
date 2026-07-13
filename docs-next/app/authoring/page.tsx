import { DocPageView } from '../../components/DocPageView';
import page from '../../content/authoring';
import { meta as ex0Meta, code as ex0Code } from '../../examples/authoring/snap-drag-via-custom-apply';
import { meta as ex1Meta, code as ex1Code } from '../../examples/authoring/drag-to-reorder';

const examples = {
  'authoring/snap-drag-via-custom-apply': { meta: ex0Meta, code: ex0Code },
  'authoring/drag-to-reorder': { meta: ex1Meta, code: ex1Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
