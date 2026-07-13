import { DocPageView } from '../../components/DocPageView';
import page from '../../content/widgets';
import { meta as ex0Meta, code as ex0Code } from '../../examples/widgets/as-a-widget';
import { meta as ex1Meta, code as ex1Code } from '../../examples/widgets/the-same-thing-plain-api';
import { meta as ex2Meta, code as ex2Code } from '../../examples/widgets/as-a-widget-pick-2';
import { meta as ex3Meta, code as ex3Code } from '../../examples/widgets/the-same-thing-plain-api-2';
import { meta as ex4Meta, code as ex4Code } from '../../examples/widgets/as-a-widget-2';
import { meta as ex5Meta, code as ex5Code } from '../../examples/widgets/plain-api-track-as-a-guide';
import { meta as ex6Meta, code as ex6Code } from '../../examples/widgets/plain-api-track-as-a-centred-axis';
import { meta as ex7Meta, code as ex7Code } from '../../examples/widgets/as-a-widget-3';
import { meta as ex8Meta, code as ex8Code } from '../../examples/widgets/the-same-thing-plain-api-3';
import { meta as ex9Meta, code as ex9Code } from '../../examples/widgets/as-a-widget-4';
import { meta as ex10Meta, code as ex10Code } from '../../examples/widgets/plain-api-crosshair-as-a-guide';
import { meta as ex11Meta, code as ex11Code } from '../../examples/widgets/plain-api-crosshair-as-centred-axes';
import { meta as ex12Meta, code as ex12Code } from '../../examples/widgets/plain-api-axes-for-the-frame-guides-for-labels';
import { meta as ex13Meta, code as ex13Code } from '../../examples/widgets/override-just-the-answer-mark';
import { meta as ex14Meta, code as ex14Code } from '../../examples/widgets/swap-the-affordance-guide';
import { meta as ex15Meta, code as ex15Code } from '../../examples/widgets/retheme-in-the-guide-helpers';
import { meta as ex16Meta, code as ex16Code } from '../../examples/widgets/ranking';
import { meta as ex17Meta, code as ex17Code } from '../../examples/widgets/allocation';
import { meta as ex18Meta, code as ex18Code } from '../../examples/widgets/region';
import { meta as ex19Meta, code as ex19Code } from '../../examples/widgets/interval-ci';

const examples = {
  'widgets/as-a-widget': { meta: ex0Meta, code: ex0Code },
  'widgets/the-same-thing-plain-api': { meta: ex1Meta, code: ex1Code },
  'widgets/as-a-widget-pick-2': { meta: ex2Meta, code: ex2Code },
  'widgets/the-same-thing-plain-api-2': { meta: ex3Meta, code: ex3Code },
  'widgets/as-a-widget-2': { meta: ex4Meta, code: ex4Code },
  'widgets/plain-api-track-as-a-guide': { meta: ex5Meta, code: ex5Code },
  'widgets/plain-api-track-as-a-centred-axis': { meta: ex6Meta, code: ex6Code },
  'widgets/as-a-widget-3': { meta: ex7Meta, code: ex7Code },
  'widgets/the-same-thing-plain-api-3': { meta: ex8Meta, code: ex8Code },
  'widgets/as-a-widget-4': { meta: ex9Meta, code: ex9Code },
  'widgets/plain-api-crosshair-as-a-guide': { meta: ex10Meta, code: ex10Code },
  'widgets/plain-api-crosshair-as-centred-axes': { meta: ex11Meta, code: ex11Code },
  'widgets/plain-api-axes-for-the-frame-guides-for-labels': { meta: ex12Meta, code: ex12Code },
  'widgets/override-just-the-answer-mark': { meta: ex13Meta, code: ex13Code },
  'widgets/swap-the-affordance-guide': { meta: ex14Meta, code: ex14Code },
  'widgets/retheme-in-the-guide-helpers': { meta: ex15Meta, code: ex15Code },
  'widgets/ranking': { meta: ex16Meta, code: ex16Code },
  'widgets/allocation': { meta: ex17Meta, code: ex17Code },
  'widgets/region': { meta: ex18Meta, code: ex18Code },
  'widgets/interval-ci': { meta: ex19Meta, code: ex19Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
