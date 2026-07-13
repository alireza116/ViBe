import { DocPageView } from '../../components/DocPageView';
import page from '../../content/constraints';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../examples/constraints/bars-that-compensate';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../examples/constraints/clamped-drag-with-a-guide';
import Ex2, { meta as ex2Meta, code as ex2Code } from '../../examples/constraints/one-bar-per-category';
import Ex3, { meta as ex3Meta, code as ex3Code } from '../../examples/constraints/composite-key-a-band-band-grid';

const examples = {
  'constraints/bars-that-compensate': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'constraints/clamped-drag-with-a-guide': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
  'constraints/one-bar-per-category': { meta: ex2Meta, code: ex2Code, Component: Ex2 },
  'constraints/composite-key-a-band-band-grid': { meta: ex3Meta, code: ex3Code, Component: Ex3 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
