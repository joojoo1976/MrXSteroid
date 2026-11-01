import { permanentRedirect } from 'next/navigation';

export default function ProteinNeedsLegacyRedirect() {
  permanentRedirect('/smarttools/nutrition/protein-needs');
}
