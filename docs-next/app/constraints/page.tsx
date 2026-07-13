import { DocPageView } from '../../components/DocPageView';
import page from '../../content/constraints';
import { meta as ex0Meta, code as ex0Code } from '../../examples/constraints/bars-that-compensate';
import { meta as ex1Meta, code as ex1Code } from '../../examples/constraints/clamped-drag-with-a-guide';
import { meta as ex2Meta, code as ex2Code } from '../../examples/constraints/one-bar-per-category';
import { meta as ex3Meta, code as ex3Code } from '../../examples/constraints/composite-key-a-band-band-grid';

const examples = {
  'constraints/bars-that-compensate': { meta: ex0Meta, code: ex0Code },
  'constraints/clamped-drag-with-a-guide': { meta: ex1Meta, code: ex1Code },
  'constraints/one-bar-per-category': { meta: ex2Meta, code: ex2Code },
  'constraints/composite-key-a-band-band-grid': { meta: ex3Meta, code: ex3Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
