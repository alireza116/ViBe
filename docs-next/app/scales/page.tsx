import { DocPageView } from '../../components/DocPageView';
import page from '../../content/scales';
import { meta as ex0Meta, code as ex0Code } from '../../examples/scales/no-scale-named-anywhere';
import { meta as ex1Meta, code as ex1Code } from '../../examples/scales/sequential-ramp-size';
import { meta as ex2Meta, code as ex2Code } from '../../examples/scales/log-sqrt-an-adopted-d3-scale';
import { meta as ex3Meta, code as ex3Code } from '../../examples/scales/ordinal-palette';
import { meta as ex4Meta, code as ex4Code } from '../../examples/scales/a-discrete-grid';

const examples = {
  'scales/no-scale-named-anywhere': { meta: ex0Meta, code: ex0Code },
  'scales/sequential-ramp-size': { meta: ex1Meta, code: ex1Code },
  'scales/log-sqrt-an-adopted-d3-scale': { meta: ex2Meta, code: ex2Code },
  'scales/ordinal-palette': { meta: ex3Meta, code: ex3Code },
  'scales/a-discrete-grid': { meta: ex4Meta, code: ex4Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
