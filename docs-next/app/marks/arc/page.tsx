import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-arc';
import { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-arc/party-shares';
import { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-arc/donut-with-center-text';
import { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-arc/drag-any-boundary';
import { meta as ex3Meta, code as ex3Code } from '../../../examples/marks-arc/donut-four-slices';

const examples = {
  'marks-arc/party-shares': { meta: ex0Meta, code: ex0Code },
  'marks-arc/donut-with-center-text': { meta: ex1Meta, code: ex1Code },
  'marks-arc/drag-any-boundary': { meta: ex2Meta, code: ex2Code },
  'marks-arc/donut-four-slices': { meta: ex3Meta, code: ex3Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
