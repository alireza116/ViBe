import { DocPageView } from '../../components/DocPageView';
import page from '../../content/scales';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../examples/scales/no-scale-named-anywhere';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../examples/scales/sequential-ramp-size';
import Ex2, { meta as ex2Meta, code as ex2Code } from '../../examples/scales/log-sqrt-an-adopted-d3-scale';
import Ex3, { meta as ex3Meta, code as ex3Code } from '../../examples/scales/ordinal-palette';
import Ex4, { meta as ex4Meta, code as ex4Code } from '../../examples/scales/a-discrete-grid';

const examples = {
  'scales/no-scale-named-anywhere': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'scales/sequential-ramp-size': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
  'scales/log-sqrt-an-adopted-d3-scale': { meta: ex2Meta, code: ex2Code, Component: Ex2 },
  'scales/ordinal-palette': { meta: ex3Meta, code: ex3Code, Component: Ex3 },
  'scales/a-discrete-grid': { meta: ex4Meta, code: ex4Code, Component: Ex4 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
