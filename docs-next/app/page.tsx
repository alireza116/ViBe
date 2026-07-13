import { DocPageView } from '../components/DocPageView';
import page from '../content/intro';
import {
  meta as allocateMeta,
  code as allocateCode,
} from '../examples/intro/allocate-a-budget';
import {
  meta as beliefsMeta,
  code as beliefsCode,
} from '../examples/intro/place-beliefs';
import {
  meta as forecastMeta,
  code as forecastCode,
} from '../examples/intro/draw-a-forecast';
import {
  meta as needleMeta,
  code as needleCode,
} from '../examples/intro/likelihood-needle';
import {
  meta as geoMeta,
  code as geoCode,
} from '../examples/intro/pins-on-a-map';
import {
  meta as scaleMeta,
  code as scaleCode,
} from '../examples/intro/answer-a-scale';
import {
  meta as anatomyMeta,
  code as anatomyCode,
} from '../examples/intro/how-a-chart-is-built';

const examples = {
  'intro/allocate-a-budget': { meta: allocateMeta, code: allocateCode },
  'intro/place-beliefs': { meta: beliefsMeta, code: beliefsCode },
  'intro/draw-a-forecast': { meta: forecastMeta, code: forecastCode },
  'intro/likelihood-needle': { meta: needleMeta, code: needleCode },
  'intro/pins-on-a-map': { meta: geoMeta, code: geoCode },
  'intro/answer-a-scale': { meta: scaleMeta, code: scaleCode },
  'intro/how-a-chart-is-built': { meta: anatomyMeta, code: anatomyCode },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
