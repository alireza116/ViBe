import { DocPageView } from '../../components/DocPageView';
import page from '../../content/concepts';
import Ex0, { meta as ex0Meta, code as ex0Code } from '../../examples/concepts/field-driven-colour-ordinal-palette';
import Ex1, { meta as ex1Meta, code as ex1Code } from '../../examples/concepts/constant-style-shorthands';

const examples = {
  'concepts/field-driven-colour-ordinal-palette': { meta: ex0Meta, code: ex0Code, Component: Ex0 },
  'concepts/constant-style-shorthands': { meta: ex1Meta, code: ex1Code, Component: Ex1 },
};

export default function Page() {
  return <DocPageView page={page} examples={examples} />;
}
