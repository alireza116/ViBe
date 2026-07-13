import { DocPageView } from '../../components/DocPageView';
import page from '../../content/overview';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../examples/overview/a-bar-mark';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../examples/overview/the-same-bar-now-editable';

const examples = {
  'overview/a-bar-mark': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'overview/the-same-bar-now-editable': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
