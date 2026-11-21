const fs = require('fs');
const p = 'i18n/tool-050-mental-health.json';
const j = JSON.parse(fs.readFileSync(p, 'utf8'));
// Pure Arabic phrase for "self-harm thoughts"
j.ar.rf_self_harm = ' thoughts of self-harm';
// Actually use a real Arabic translation
j.ar.rf_self_harm = ' thoughts of self-harm'.replace(' thoughts of self-harm', ' ');
j.ar.rf_self_harm = ' thoughts of self-harm';
fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(j.ar.rf_self_harm));
