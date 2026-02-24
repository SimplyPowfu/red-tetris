/**
 * This script ensures the coverage object produced by the Babel plugin 
 * is captured and saved to the .nyc_output folder after tests run.
 */

function dump() {
  const coverage = global.__coverage__;
  if (coverage) {
    const fs = require('fs');
    const path = require('path');
    const dir = path.resolve(process.cwd(), '.nyc_output');

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const filename = `coverage-${Date.now()}-${Math.random().toString(36).substr(2, 5)}.json`;
    fs.writeFileSync(path.join(dir, filename), JSON.stringify(coverage));
  }
}

// If Mocha globals are already here, use them. 
// Otherwise, wait for the process to exit to dump the data.
if (typeof after === 'function') {
  after(dump);
} else {
  process.on('exit', dump);
}