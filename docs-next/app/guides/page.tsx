import { DocPageView } from '../../components/DocPageView';
import page from '../../content/guides';
import { meta as ex0Meta, code as ex0Code } from '../../examples/guides/a-target-band-with-a-rule';
import { meta as ex1Meta, code as ex1Code } from '../../examples/guides/a-mean-line-that-chases-the-bars';

const examples = {
  'guides/a-target-band-with-a-rule': { meta: ex0Meta, code: ex0Code },
  'guides/a-mean-line-that-chases-the-bars': { meta: ex1Meta, code: ex1Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
