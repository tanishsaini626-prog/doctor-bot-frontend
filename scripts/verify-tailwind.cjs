// Definitive check: does the built CSS contain variant rules?
// Builds the backslash character with String.fromCharCode(92) so no shell/JS
// escaping can interfere.
const fs = require('fs');
const path = require('path');

const BS = String.fromCharCode(92);
const dir = 'C:/Users/saini/doctor-bot-frontend/dist/assets';
const cssFile = fs.readdirSync(dir).find((f) => f.endsWith('.css'));
const css = fs.readFileSync(path.join(dir, cssFile), 'utf8');

const probes = ['dark' + BS + ':bg-gray-800', 'hover' + BS + ':bg-slate-700', 'md' + BS + ':flex', 'xl' + BS + ':grid-cols-4', 'sm' + BS + ':grid-cols-2'];
console.log('CSS bundle:', cssFile, (css.length / 1024).toFixed(1) + ' KB\n');
for (const p of probes) {
  console.log(' ', p.padEnd(28), css.includes(p) ? 'FOUND' : 'MISSING');
}
const count = (needle) => css.split(needle).length - 1;
console.log('\n  dark:  variant rules =', count('.dark' + BS + ':'));
console.log('  hover: variant rules =', count('.hover' + BS + ':'));
console.log('  md:    variant rules =', count('.md' + BS + ':'));
console.log('  xl:    variant rules =', count('.xl' + BS + ':'));
console.log('\n  utilities total      =', count('{') , 'rules');
