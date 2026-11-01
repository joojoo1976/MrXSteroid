
const fs = require('fs');
const path = require('path');

// Auto install script for E:\MrXSteroid-main
const source = 'E:\\temp\\v5-genius';
const dest = 'E:\\MrXSteroid-main';

const mappings = [
  { from: 'registry/tools.registry.v5.ts', to: 'lib/registry/tools.registry.v5.ts' },
  { from: 'engines/core/ai-orchestrator.v5.ts', to: 'lib/engines/core/ai-orchestrator.v5.ts' },
  { from: 'engines/core/future/ml-models.ts', to: 'lib/engines/core/future/ml-models.ts' },
  { from: 'engines/tools', to: 'lib/engines/tools', isDir: true },
];

console.log('Installing v5 Genius to', dest);
mappings.forEach(m => {
  const fromPath = path.join(source, m.from);
  const toPath = path.join(dest, m.to);
  if (m.isDir) {
    fs.cpSync(fromPath, toPath, { recursive: true });
  } else {
    fs.mkdirSync(path.dirname(toPath), { recursive: true });
    fs.copyFileSync(fromPath, toPath);
  }
  console.log(`Copied ${m.from} -> ${m.to}`);
});
console.log('Done! Now run npm run dev');
