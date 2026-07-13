import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-axis-radial';
import { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-axis-radial/semi-circle-axis';
import { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-axis-radial/banded-likelihood-arc';
import { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-axis-radial/percent-ticks-at-chosen-values';

const examples = {
  'marks-axis-radial/semi-circle-axis': { meta: ex0Meta, code: ex0Code },
  'marks-axis-radial/banded-likelihood-arc': { meta: ex1Meta, code: ex1Code },
  'marks-axis-radial/percent-ticks-at-chosen-values': { meta: ex2Meta, code: ex2Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
