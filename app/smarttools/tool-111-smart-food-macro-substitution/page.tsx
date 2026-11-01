import { permanentRedirect } from 'next/navigation';

/** Preserve the retired flat URL while routing users to the registered Tool 111 page. */
export default function Tool111LegacyRedirect() {
  permanentRedirect('/smarttools/nutrition/tool-111-smart-food-macro-substitution');
}
