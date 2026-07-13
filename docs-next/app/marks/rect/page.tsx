import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-rect';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-rect/region-boxes';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-rect/pre-binned-counts';
import Ex2, { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-rect/editable-bin-heights';
import Ex3, { meta as ex3Meta, code as ex3Code } from '../../../examples/marks-rect/full-2-d-edges-corners-body';
import Ex4, { meta as ex4Meta, code as ex4Code } from '../../../examples/marks-rect/resize-x-only';
import Ex5, { meta as ex5Meta, code as ex5Code } from '../../../examples/marks-rect/move-only';

const examples = {
  'marks-rect/region-boxes': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'marks-rect/pre-binned-counts': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
  'marks-rect/editable-bin-heights': { meta: ex2Meta, code: ex2Code, Component: Ex2 },
  'marks-rect/full-2-d-edges-corners-body': { meta: ex3Meta, code: ex3Code, Component: Ex3 },
  'marks-rect/resize-x-only': { meta: ex4Meta, code: ex4Code, Component: Ex4 },
  'marks-rect/move-only': { meta: ex5Meta, code: ex5Code, Component: Ex5 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
