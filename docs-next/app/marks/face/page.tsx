import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-face';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-face/valence-arousal';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-face/full-chernoff-face';
import Ex2, { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-face/a-mood-per-person';

const examples = {
  'marks-face/valence-arousal': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'marks-face/full-chernoff-face': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
  'marks-face/a-mood-per-person': { meta: ex2Meta, code: ex2Code, Component: Ex2 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
