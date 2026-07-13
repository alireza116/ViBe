import { DocPageView } from '../components/DocPageView';
import page from '../content/intro';
import AllocateABudget, {
  meta as allocateMeta,
  code as allocateCode,
} from '../examples/intro/allocate-a-budget';
import PlaceBeliefs, {
  meta as beliefsMeta,
  code as beliefsCode,
} from '../examples/intro/place-beliefs';
import DrawAForecast, {
  meta as forecastMeta,
  code as forecastCode,
} from '../examples/intro/draw-a-forecast';
import LikelihoodNeedle, {
  meta as needleMeta,
  code as needleCode,
} from '../examples/intro/likelihood-needle';
import PinsOnAMap, {
  meta as geoMeta,
  code as geoCode,
} from '../examples/intro/pins-on-a-map';
import AnswerAScale, {
  meta as scaleMeta,
  code as scaleCode,
} from '../examples/intro/answer-a-scale';
import HowAChartIsBuilt, {
  meta as anatomyMeta,
  code as anatomyCode,
} from '../examples/intro/how-a-chart-is-built';

const examples = {
  'intro/allocate-a-budget': {
    meta: allocateMeta,
    code: allocateCode,
    Component: AllocateABudget,
  },
  'intro/place-beliefs': {
    meta: beliefsMeta,
    code: beliefsCode,
    Component: PlaceBeliefs,
  },
  'intro/draw-a-forecast': {
    meta: forecastMeta,
    code: forecastCode,
    Component: DrawAForecast,
  },
  'intro/likelihood-needle': {
    meta: needleMeta,
    code: needleCode,
    Component: LikelihoodNeedle,
  },
  'intro/pins-on-a-map': {
    meta: geoMeta,
    code: geoCode,
    Component: PinsOnAMap,
  },
  'intro/answer-a-scale': {
    meta: scaleMeta,
    code: scaleCode,
    Component: AnswerAScale,
  },
  'intro/how-a-chart-is-built': {
    meta: anatomyMeta,
    code: anatomyCode,
    Component: HowAChartIsBuilt,
  },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
