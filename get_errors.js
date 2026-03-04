import fs from 'node:fs';
const d = JSON.parse(fs.readFileSync('test_results2.json', 'utf8'));
d.testResults.forEach(t => {
    t.assertionResults.filter(a => a.status === 'failed').forEach(a => {
        console.log(`\nFILE: ${t.name.split('/').pop()}`);
        console.log(`TEST: ${a.ancestorTitles.join(' > ')} > ${a.title}`);
        console.log(`MSG: ${a.failureMessages[0].substring(0, 300).replace(/\n/g, ' ')}...`);
    });
});
