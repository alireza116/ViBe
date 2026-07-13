import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-dotstack';
import { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-dotstack/probability-tokens-over-bins';
import { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-dotstack/tentative-dot-on-hover-probe';
import { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-dotstack/per-slot-cap-with-unique';

const examples = {
  'marks-dotstack/probability-tokens-over-bins': { meta: ex0Meta, code: ex0Code },
  'marks-dotstack/tentative-dot-on-hover-probe': { meta: ex1Meta, code: ex1Code },
  'marks-dotstack/per-slot-cap-with-unique': { meta: ex2Meta, code: ex2Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
