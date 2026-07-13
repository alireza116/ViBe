import { DocPageView } from '../../components/DocPageView';
import page from '../../content/schema';
import { meta as ex0Meta, code as ex0Code } from '../../examples/schema/elicit-from-nothing';
import { meta as ex1Meta, code as ex1Code } from '../../examples/schema/beliefs-over-time';

const examples = {
  'schema/elicit-from-nothing': { meta: ex0Meta, code: ex0Code },
  'schema/beliefs-over-time': { meta: ex1Meta, code: ex1Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
