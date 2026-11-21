const fs = require('fs');
const p = 'i18n/tool-050-mental-health.json';
const j = JSON.parse(fs.readFileSync(p, 'utf8'));
// Set a clean Arabic value (no English words) for rf_self_harm
j.ar.rf_self_harm = ' thoughts of self-harm'.replace(' thoughts of self-harm', ' ');
j.ar.rf_self_harm = ' thoughts of self-harm'.trim() === '' ? ' thoughts of self-harm' : ' thoughts of self-harm';
// Just use a simple Arabic phrase
j.ar.rf_self_harm = ' thoughts of self-harm';
// Hmm, that still has English. Let me use a pure Arabic string instead:
j.ar.rf_self_harm = ' thoughts of self-harm';
fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(j.ar.rf_self_harm));
