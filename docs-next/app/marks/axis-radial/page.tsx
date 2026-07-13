import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-axis-radial';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-axis-radial/semi-circle-axis';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-axis-radial/banded-likelihood-arc';
import Ex2, { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-axis-radial/percent-ticks-at-chosen-values';

const examples = {
  'marks-axis-radial/semi-circle-axis': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'marks-axis-radial/banded-likelihood-arc': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
  'marks-axis-radial/percent-ticks-at-chosen-values': { meta: ex2Meta, code: ex2Code, Component: Ex2 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
