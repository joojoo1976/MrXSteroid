const fs = require('fs');
const p = 'i18n/tool-049-bone-density.json';
const j = JSON.parse(fs.readFileSync(p, 'utf8'));
j.ar.box6_effect_status = ' changed'.trim().replace('changed', 'changed');
// Set proper Arabic translations matching tool 048 convention:
j.ar.box6_effect_status = ' changed';
j.ar.box6_effect_no_status = ' no change';
fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n', 'utf8');
console.log('done');
