import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-geo';
import { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-geo/vancouver-local-areas';
import { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-geo/pins-on-openstreetmap';
import { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-geo/tiles-under-the-neighborhood-outlines';
import { meta as ex3Meta, code as ex3Code } from '../../../examples/marks-geo/belief-pins-on-vancouver';
import { meta as ex4Meta, code as ex4Code } from '../../../examples/marks-geo/named-pins-you-can-rename';
import { meta as ex5Meta, code as ex5Code } from '../../../examples/marks-geo/cycle-fill-on-selected-local-areas';
import { meta as ex6Meta, code as ex6Code } from '../../../examples/marks-geo/draw-a-path-across-vancouver';
import { meta as ex7Meta, code as ex7Code } from '../../../examples/marks-geo/reshape-a-seeded-broadway-ish-line';
import { meta as ex8Meta, code as ex8Code } from '../../../examples/marks-geo/a-route-across-vancouver';
import { meta as ex9Meta, code as ex9Code } from '../../../examples/marks-geo/study-areas-over-the-city';

const examples = {
  'marks-geo/vancouver-local-areas': { meta: ex0Meta, code: ex0Code },
  'marks-geo/pins-on-openstreetmap': { meta: ex1Meta, code: ex1Code },
  'marks-geo/tiles-under-the-neighborhood-outlines': { meta: ex2Meta, code: ex2Code },
  'marks-geo/belief-pins-on-vancouver': { meta: ex3Meta, code: ex3Code },
  'marks-geo/named-pins-you-can-rename': { meta: ex4Meta, code: ex4Code },
  'marks-geo/cycle-fill-on-selected-local-areas': { meta: ex5Meta, code: ex5Code },
  'marks-geo/draw-a-path-across-vancouver': { meta: ex6Meta, code: ex6Code },
  'marks-geo/reshape-a-seeded-broadway-ish-line': { meta: ex7Meta, code: ex7Code },
  'marks-geo/a-route-across-vancouver': { meta: ex8Meta, code: ex8Code },
  'marks-geo/study-areas-over-the-city': { meta: ex9Meta, code: ex9Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
