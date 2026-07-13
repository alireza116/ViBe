import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-bar';
import { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-bar/a-vertical-bar-chart';
import { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-bar/colour-by-a-field';
import { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-bar/barx-value-on-x';
import { meta as ex3Meta, code as ex3Code } from '../../../examples/marks-bar/years-active-per-person';
import { meta as ex4Meta, code as ex4Code } from '../../../examples/marks-bar/brush-edges-body-together';
import { meta as ex5Meta, code as ex5Code } from '../../../examples/marks-bar/drag-a-value';
import { meta as ex6Meta, code as ex6Code } from '../../../examples/marks-bar/nearest-pick-self-drawn-guide';

const examples = {
  'marks-bar/a-vertical-bar-chart': { meta: ex0Meta, code: ex0Code },
  'marks-bar/colour-by-a-field': { meta: ex1Meta, code: ex1Code },
  'marks-bar/barx-value-on-x': { meta: ex2Meta, code: ex2Code },
  'marks-bar/years-active-per-person': { meta: ex3Meta, code: ex3Code },
  'marks-bar/brush-edges-body-together': { meta: ex4Meta, code: ex4Code },
  'marks-bar/drag-a-value': { meta: ex5Meta, code: ex5Code },
  'marks-bar/nearest-pick-self-drawn-guide': { meta: ex6Meta, code: ex6Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
