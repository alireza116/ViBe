import { DocPageView } from '../../components/DocPageView';
import page from '../../content/widgets';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../examples/widgets/as-a-widget';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../examples/widgets/the-same-thing-plain-api';
import Ex2, { meta as ex2Meta, code as ex2Code } from '../../examples/widgets/as-a-widget-pick-2';
import Ex3, { meta as ex3Meta, code as ex3Code } from '../../examples/widgets/the-same-thing-plain-api-2';
import Ex4, { meta as ex4Meta, code as ex4Code } from '../../examples/widgets/as-a-widget-2';
import Ex5, { meta as ex5Meta, code as ex5Code } from '../../examples/widgets/plain-api-track-as-a-guide';
import Ex6, { meta as ex6Meta, code as ex6Code } from '../../examples/widgets/plain-api-track-as-a-centred-axis';
import Ex7, { meta as ex7Meta, code as ex7Code } from '../../examples/widgets/as-a-widget-3';
import Ex8, { meta as ex8Meta, code as ex8Code } from '../../examples/widgets/the-same-thing-plain-api-3';
import Ex9, { meta as ex9Meta, code as ex9Code } from '../../examples/widgets/as-a-widget-4';
import Ex10, { meta as ex10Meta, code as ex10Code } from '../../examples/widgets/plain-api-crosshair-as-a-guide';
import Ex11, { meta as ex11Meta, code as ex11Code } from '../../examples/widgets/plain-api-crosshair-as-centred-axes';
import Ex12, { meta as ex12Meta, code as ex12Code } from '../../examples/widgets/plain-api-axes-for-the-frame-guides-for-labels';
import Ex13, { meta as ex13Meta, code as ex13Code } from '../../examples/widgets/override-just-the-answer-mark';
import Ex14, { meta as ex14Meta, code as ex14Code } from '../../examples/widgets/swap-the-affordance-guide';
import Ex15, { meta as ex15Meta, code as ex15Code } from '../../examples/widgets/retheme-in-the-guide-helpers';
import Ex16, { meta as ex16Meta, code as ex16Code } from '../../examples/widgets/ranking';
import Ex17, { meta as ex17Meta, code as ex17Code } from '../../examples/widgets/allocation';
import Ex18, { meta as ex18Meta, code as ex18Code } from '../../examples/widgets/region';
import Ex19, { meta as ex19Meta, code as ex19Code } from '../../examples/widgets/interval-ci';

const examples = {
  'widgets/as-a-widget': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'widgets/the-same-thing-plain-api': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
  'widgets/as-a-widget-pick-2': { meta: ex2Meta, code: ex2Code, Component: Ex2 },
  'widgets/the-same-thing-plain-api-2': { meta: ex3Meta, code: ex3Code, Component: Ex3 },
  'widgets/as-a-widget-2': { meta: ex4Meta, code: ex4Code, Component: Ex4 },
  'widgets/plain-api-track-as-a-guide': { meta: ex5Meta, code: ex5Code, Component: Ex5 },
  'widgets/plain-api-track-as-a-centred-axis': { meta: ex6Meta, code: ex6Code, Component: Ex6 },
  'widgets/as-a-widget-3': { meta: ex7Meta, code: ex7Code, Component: Ex7 },
  'widgets/the-same-thing-plain-api-3': { meta: ex8Meta, code: ex8Code, Component: Ex8 },
  'widgets/as-a-widget-4': { meta: ex9Meta, code: ex9Code, Component: Ex9 },
  'widgets/plain-api-crosshair-as-a-guide': { meta: ex10Meta, code: ex10Code, Component: Ex10 },
  'widgets/plain-api-crosshair-as-centred-axes': { meta: ex11Meta, code: ex11Code, Component: Ex11 },
  'widgets/plain-api-axes-for-the-frame-guides-for-labels': { meta: ex12Meta, code: ex12Code, Component: Ex12 },
  'widgets/override-just-the-answer-mark': { meta: ex13Meta, code: ex13Code, Component: Ex13 },
  'widgets/swap-the-affordance-guide': { meta: ex14Meta, code: ex14Code, Component: Ex14 },
  'widgets/retheme-in-the-guide-helpers': { meta: ex15Meta, code: ex15Code, Component: Ex15 },
  'widgets/ranking': { meta: ex16Meta, code: ex16Code, Component: Ex16 },
  'widgets/allocation': { meta: ex17Meta, code: ex17Code, Component: Ex17 },
  'widgets/region': { meta: ex18Meta, code: ex18Code, Component: Ex18 },
  'widgets/interval-ci': { meta: ex19Meta, code: ex19Code, Component: Ex19 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
