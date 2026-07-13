import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-tick';
import { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-tick/ticks-over-a-band-axis';
import { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-tick/drag-a-value-ticks';
import { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-tick/tickx-a-distribution-strip';

const examples = {
  'marks-tick/ticks-over-a-band-axis': { meta: ex0Meta, code: ex0Code },
  'marks-tick/drag-a-value-ticks': { meta: ex1Meta, code: ex1Code },
  'marks-tick/tickx-a-distribution-strip': { meta: ex2Meta, code: ex2Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
