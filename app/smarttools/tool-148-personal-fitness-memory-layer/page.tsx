import { permanentRedirect } from 'next/navigation';
import { toHierarchicalHref } from '@/lib/tools/categories';

export default function FlatPersonalFitnessMemoryLayerRedirect() {
  permanentRedirect(toHierarchicalHref('tool-148-personal-fitness-memory-layer') ?? '/smarttools');
}
