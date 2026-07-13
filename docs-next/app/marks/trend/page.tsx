import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-trend';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-trend/trend-line';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-trend/both-handles-at-once';

const examples = {
  'marks-trend/trend-line': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'marks-trend/both-handles-at-once': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
