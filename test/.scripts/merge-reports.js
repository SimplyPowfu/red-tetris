const fs = require('fs');
const path = require('path');
const istanbul = require('istanbul');
const collector = new istanbul.Collector();
const nycDir = path.join(process.cwd(), '.nyc_output');

const files = fs.readdirSync(nycDir).filter(f => f.endsWith('.json'));
const combinedData = {};

files.forEach(file => {
  const filePathFull = path.join(nycDir, file);
  const content = JSON.parse(fs.readFileSync(filePathFull, 'utf8'));
  
  Object.keys(content).forEach(filePath => {
    if (!combinedData[filePath]) {
      combinedData[filePath] = content[filePath];
    } else {
      const existing = combinedData[filePath];
      const incoming = content[filePath];
      
      // Merge Statements
      if (incoming.s && existing.s) {
        Object.keys(incoming.s).forEach(k => { if(existing.s[k] !== undefined) existing.s[k] += incoming.s[k]; });
      }
      // Merge Functions
      if (incoming.f && existing.f) {
        Object.keys(incoming.f).forEach(k => { if(existing.f[k] !== undefined) existing.f[k] += incoming.f[k]; });
      }
      // Merge Branches
      if (incoming.b && existing.b) {
        Object.keys(incoming.b).forEach(k => { 
          if(existing.b[k] && incoming.b[k]) {
             incoming.b[k].forEach((val, i) => { 
               if (existing.b[k][i] !== undefined) existing.b[k][i] += val; 
             });
          }
        });
      }
    }
  });
});

fs.writeFileSync('coverage.json', JSON.stringify(combinedData));
console.log('Successfully merged coverage into coverage.json');