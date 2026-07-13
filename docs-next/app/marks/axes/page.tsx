import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-axes';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-axes/gridlines-ticks-format-title';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-axes/origin-crossing-axes';
import Ex2, { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-axes/1d-centered-slider-axis';
import Ex3, { meta as ex3Meta, code as ex3Code } from '../../../examples/marks-axes/explicit-gridy-axisx-axisy-ruley';

const examples = {
  'marks-axes/gridlines-ticks-format-title': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'marks-axes/origin-crossing-axes': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
  'marks-axes/1d-centered-slider-axis': { meta: ex2Meta, code: ex2Code, Component: Ex2 },
  'marks-axes/explicit-gridy-axisx-axisy-ruley': { meta: ex3Meta, code: ex3Code, Component: Ex3 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
