import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-symbol';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-symbol/mood-over-the-week';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-symbol/star-tokens';
import Ex2, { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-symbol/fruit-basket';
import Ex3, { meta as ex3Meta, code as ex3Code } from '../../../examples/marks-symbol/pick-a-weather';
import Ex4, { meta as ex4Meta, code as ex4Code } from '../../../examples/marks-symbol/world-cup-goals';

const examples = {
  'marks-symbol/mood-over-the-week': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'marks-symbol/star-tokens': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
  'marks-symbol/fruit-basket': { meta: ex2Meta, code: ex2Code, Component: Ex2 },
  'marks-symbol/pick-a-weather': { meta: ex3Meta, code: ex3Code, Component: Ex3 },
  'marks-symbol/world-cup-goals': { meta: ex4Meta, code: ex4Code, Component: Ex4 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
