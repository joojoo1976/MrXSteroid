/**
 * scripts/validate-tools.ts
 * Vérification complète de la plateforme SmartTools :
 *   - catalogue (30 outils terminés)
 *   - registry canonique
 *   - fichiers moteurs / schémas / composants présents sur le disque
 *   - unicité des routes legacy / canoniques
 *   - génération des URLs canoniques et du lien de navigation
 *
 *   Usage :
 *     npm run validate-tools
 */

import { runValidation } from '../lib/tools/validation';

const result = runValidation();

console.log('\n🔎 Validate Tools — SmartTools Platform\n');
for (const line of result.lines) {
  console.log('  • ' + line);
}
console.log('');

if (!result.ok) {
  console.error('❌ Échec de la validation !');
  for (const err of result.errors) {
    console.error('  ✗ ' + err);
  }
  console.log('');
  process.exit(1);
}

console.log('✅ Tout est conforme.');
console.log('');
process.exit(0);
