import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-geo';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-geo/vancouver-local-areas';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-geo/pins-on-openstreetmap';
import Ex2, { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-geo/tiles-under-the-neighborhood-outlines';
import Ex3, { meta as ex3Meta, code as ex3Code } from '../../../examples/marks-geo/belief-pins-on-vancouver';
import Ex4, { meta as ex4Meta, code as ex4Code } from '../../../examples/marks-geo/named-pins-you-can-rename';
import Ex5, { meta as ex5Meta, code as ex5Code } from '../../../examples/marks-geo/cycle-fill-on-selected-local-areas';
import Ex6, { meta as ex6Meta, code as ex6Code } from '../../../examples/marks-geo/draw-a-path-across-vancouver';
import Ex7, { meta as ex7Meta, code as ex7Code } from '../../../examples/marks-geo/reshape-a-seeded-broadway-ish-line';
import Ex8, { meta as ex8Meta, code as ex8Code } from '../../../examples/marks-geo/a-route-across-vancouver';
import Ex9, { meta as ex9Meta, code as ex9Code } from '../../../examples/marks-geo/study-areas-over-the-city';

const examples = {
  'marks-geo/vancouver-local-areas': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'marks-geo/pins-on-openstreetmap': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
  'marks-geo/tiles-under-the-neighborhood-outlines': { meta: ex2Meta, code: ex2Code, Component: Ex2 },
  'marks-geo/belief-pins-on-vancouver': { meta: ex3Meta, code: ex3Code, Component: Ex3 },
  'marks-geo/named-pins-you-can-rename': { meta: ex4Meta, code: ex4Code, Component: Ex4 },
  'marks-geo/cycle-fill-on-selected-local-areas': { meta: ex5Meta, code: ex5Code, Component: Ex5 },
  'marks-geo/draw-a-path-across-vancouver': { meta: ex6Meta, code: ex6Code, Component: Ex6 },
  'marks-geo/reshape-a-seeded-broadway-ish-line': { meta: ex7Meta, code: ex7Code, Component: Ex7 },
  'marks-geo/a-route-across-vancouver': { meta: ex8Meta, code: ex8Code, Component: Ex8 },
  'marks-geo/study-areas-over-the-city': { meta: ex9Meta, code: ex9Code, Component: Ex9 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
