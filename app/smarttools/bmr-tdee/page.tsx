import { permanentRedirect } from 'next/navigation';

export default function BmrLegacyRedirect() {
  permanentRedirect('/smarttools/nutrition/bmr-tdee');
}
