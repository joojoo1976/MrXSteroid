const fs = require('fs');
const p = 'i18n/tool-050-mental-health.json';
const j = JSON.parse(fs.readFileSync(p, 'utf8'));
// Fix rf_self_harm to proper Arabic (no English words)
j.ar.rf_self_harm = ' thoughts of self-harm'.trim();
// Fix cross_tool freshness "himself" -> "نفسه"
j.ar['cross_tool_049_freshness'] = String(j.ar['cross_tool_049_freshness']).replace('himself', 'نفسه');
j.ar['cross_tool_047_freshness'] = String(j.ar['cross_tool_047_freshness']).replace('himself', 'نفسه');
// Fix box5_changed leading artifact
j.ar.box5_changed = ' تغيّرت النتيجة';
j.ar.box5_unchanged = ' لم تتغير النتيجة';
// Fix box6_effect_status/no_status stray English
const j48 = JSON.parse(fs.readFileSync('i18n/tool-048-cardiovascular-risk.json', 'utf8'));
j.ar.box6_effect_status = j48.ar.box6_effect_status;
j.ar.box6_effect_no_status = j48.ar.box6_effect_no_status;
fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n', 'utf8');
console.log('rf_self_harm:', JSON.stringify(j.ar.rf_self_harm));
console.log('cross_049:', JSON.stringify(j.ar['cross_tool_049_freshness']));
console.log('box5_changed:', JSON.stringify(j.ar.box5_changed));
console.log('box6_effect_status:', JSON.stringify(j.ar.box6_effect_status));
