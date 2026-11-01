import { permanentRedirect } from 'next/navigation';

export default function BmiLegacyRedirect() {
  permanentRedirect('/smarttools/body-composition/bmi');
}
