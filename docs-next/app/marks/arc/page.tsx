import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-arc';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-arc/party-shares';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-arc/donut-with-center-text';
import Ex2, { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-arc/drag-any-boundary';
import Ex3, { meta as ex3Meta, code as ex3Code } from '../../../examples/marks-arc/donut-four-slices';

const examples = {
  'marks-arc/party-shares': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'marks-arc/donut-with-center-text': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
  'marks-arc/drag-any-boundary': { meta: ex2Meta, code: ex2Code, Component: Ex2 },
  'marks-arc/donut-four-slices': { meta: ex3Meta, code: ex3Code, Component: Ex3 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
