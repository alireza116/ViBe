import { DocPageView } from '../../components/DocPageView';
import page from '../../content/guides';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../examples/guides/a-target-band-with-a-rule';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../examples/guides/a-mean-line-that-chases-the-bars';

const examples = {
  'guides/a-target-band-with-a-rule': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'guides/a-mean-line-that-chases-the-bars': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
