import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-cone';
import { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-cone/line-cone';
import { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-cone/static-cone';

const examples = {
  'marks-cone/line-cone': { meta: ex0Meta, code: ex0Code },
  'marks-cone/static-cone': { meta: ex1Meta, code: ex1Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
