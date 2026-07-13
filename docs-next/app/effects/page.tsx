import { DocPageView } from '../../components/DocPageView';
import page from '../../content/effects';
import { meta as ex0Meta, code as ex0Code } from '../../examples/effects/proximity-select';
import { meta as ex1Meta, code as ex1Code } from '../../examples/effects/restyled-feedback';

const examples = {
  'effects/proximity-select': { meta: ex0Meta, code: ex0Code },
  'effects/restyled-feedback': { meta: ex1Meta, code: ex1Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
