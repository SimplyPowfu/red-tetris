const fs = require('fs');
const path = require('path');
const istanbul = require('istanbul');
const glob = require('glob'); // You might need to npm install glob

const collector = new istanbul.Collector();
const reporter = new istanbul.Reporter();
const nycDir = path.join(process.cwd(), '.nyc_output');

// 1. Seek and find all source files that SHOULD be covered
const allSrcFiles = glob.sync("src/**/*.{js,jsx}", { absolute: true });
const combinedData = {};

// 2. Load the actual hits we got from running tests
const reportFiles = fs.readdirSync(nycDir).filter(f => f.endsWith('.json'));

reportFiles.forEach(file => {
  const content = JSON.parse(fs.readFileSync(path.join(nycDir, file), 'utf8'));
  Object.keys(content).forEach(filePath => {
    // Basic filter to keep test files out of the data entirely
    if (filePath.includes('/test/') || filePath.includes('\\test\\')) return;

    if (!combinedData[filePath]) {
      combinedData[filePath] = content[filePath];
    } else {
      const existing = combinedData[filePath];
      const incoming = content[filePath];
      // Merge logic for hits
      Object.keys(incoming.s).forEach(k => { if(existing.s[k] !== undefined) existing.s[k] += incoming.s[k]; });
      Object.keys(incoming.f).forEach(k => { if(existing.f[k] !== undefined) existing.f[k] += incoming.f[k]; });
      Object.keys(incoming.b).forEach(k => { 
        if(existing.b[k] && incoming.b[k]) {
          incoming.b[k].forEach((val, i) => { if (existing.b[k][i] !== undefined) existing.b[k][i] += val; });
        }
      });
    }
  });
});

// 3. Add placeholders for files that were NEVER touched
allSrcFiles.forEach(file => {
  if (!combinedData[file]) {
    combinedData[file] = {
      path: file,
      s: { "1": 0 }, 
      f: {},
      b: {},
      statementMap: { "1": { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } } },
      fnMap: {},
      branchMap: {}
    };
  }
});

fs.writeFileSync('coverage.json', JSON.stringify(combinedData));
console.log('Successfully merged all source files into coverage.json');