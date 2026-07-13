import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/editing-lock';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/editing-lock/scatter-observed-points-yours';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../../examples/editing-lock/actuals-forecast';
import Ex2, { meta as ex2Meta, code as ex2Code } from '../../../examples/editing-lock/draw-the-line-for-the-missing-years';

const examples = {
  'editing-lock/scatter-observed-points-yours': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'editing-lock/actuals-forecast': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
  'editing-lock/draw-the-line-for-the-missing-years': { meta: ex2Meta, code: ex2Code, Component: Ex2 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
