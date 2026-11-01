import { permanentRedirect } from 'next/navigation';

export default function WaterIntakeLegacyRedirect() {
  permanentRedirect('/smarttools/nutrition/water-intake');
}
