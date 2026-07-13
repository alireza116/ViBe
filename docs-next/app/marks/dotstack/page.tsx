import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-dotstack';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-dotstack/probability-tokens-over-bins';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-dotstack/tentative-dot-on-hover-probe';
import Ex2, { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-dotstack/per-slot-cap-with-unique';

const examples = {
  'marks-dotstack/probability-tokens-over-bins': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'marks-dotstack/tentative-dot-on-hover-probe': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
  'marks-dotstack/per-slot-cap-with-unique': { meta: ex2Meta, code: ex2Code, Component: Ex2 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
