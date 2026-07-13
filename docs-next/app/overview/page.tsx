import { DocPageView } from '../../components/DocPageView';
import page from '../../content/overview';
import { meta as ex0Meta, code as ex0Code } from '../../examples/overview/a-bar-mark';
import { meta as ex1Meta, code as ex1Code } from '../../examples/overview/the-same-bar-now-editable';

const examples = {
  'overview/a-bar-mark': { meta: ex0Meta, code: ex0Code },
  'overview/the-same-bar-now-editable': { meta: ex1Meta, code: ex1Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
