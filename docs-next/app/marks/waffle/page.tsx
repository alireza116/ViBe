import { DocPageView } from '../../../components/DocPageView';
import page from '../../../content/marks-waffle';
import { meta as ex0Meta, code as ex0Code } from '../../../examples/marks-waffle/fruit-counts';
import { meta as ex1Meta, code as ex1Code } from '../../../examples/marks-waffle/proportion-picker';
import { meta as ex2Meta, code as ex2Code } from '../../../examples/marks-waffle/click-a-dot-to-set-the-count';
import { meta as ex3Meta, code as ex3Code } from '../../../examples/marks-waffle/tallies-of-1-6';

const examples = {
  'marks-waffle/fruit-counts': { meta: ex0Meta, code: ex0Code },
  'marks-waffle/proportion-picker': { meta: ex1Meta, code: ex1Code },
  'marks-waffle/click-a-dot-to-set-the-count': { meta: ex2Meta, code: ex2Code },
  'marks-waffle/tallies-of-1-6': { meta: ex3Meta, code: ex3Code },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
