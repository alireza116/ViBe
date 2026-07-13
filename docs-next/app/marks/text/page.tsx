import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-text';
import { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-text/a-labelled-scatter';
import { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-text/formatted-numeric-labels';
import { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-text/line-chart-with-value-labels';
import { meta as ex3Meta, code as ex3Code } from '../../../examples/marks-text/drag-to-reposition';
import { meta as ex4Meta, code as ex4Code } from '../../../examples/marks-text/draggable-numeric-readout';
import { meta as ex5Meta, code as ex5Code } from '../../../examples/marks-text/type-to-edit-content';
import { meta as ex6Meta, code as ex6Code } from '../../../examples/marks-text/drag-and-retype-together';

const examples = {
  'marks-text/a-labelled-scatter': { meta: ex0Meta, code: ex0Code },
  'marks-text/formatted-numeric-labels': { meta: ex1Meta, code: ex1Code },
  'marks-text/line-chart-with-value-labels': { meta: ex2Meta, code: ex2Code },
  'marks-text/drag-to-reposition': { meta: ex3Meta, code: ex3Code },
  'marks-text/draggable-numeric-readout': { meta: ex4Meta, code: ex4Code },
  'marks-text/type-to-edit-content': { meta: ex5Meta, code: ex5Code },
  'marks-text/drag-and-retype-together': { meta: ex6Meta, code: ex6Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
