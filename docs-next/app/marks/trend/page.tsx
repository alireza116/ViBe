import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-trend';
import { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-trend/trend-line';
import { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-trend/both-handles-at-once';

const examples = {
  'marks-trend/trend-line': { meta: ex0Meta, code: ex0Code },
  'marks-trend/both-handles-at-once': { meta: ex1Meta, code: ex1Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
