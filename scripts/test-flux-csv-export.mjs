import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const fluxPath = '/home/runner/work/codeflow-offline/codeflow-offline/src/flux.html';
const html = fs.readFileSync(fluxPath, 'utf8');

function extractFunction(name) {
  const signature = `function ${name}(`;
  const start = html.indexOf(signature);
  if (start === -1) {
    throw new Error(`Function not found: ${name}`);
  }
  let depth = 0;
  let bodyStart = -1;
  let end = -1;
  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (ch === '{') {
      if (bodyStart === -1) {
        bodyStart = i;
      }
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0 && bodyStart !== -1) {
        end = i;
        break;
      }
    }
  }
  if (bodyStart === -1 || end === -1) {
    throw new Error(`Malformed function: ${name}`);
  }
  return html.slice(start, end + 1);
}

const source = [
  extractFunction('sanitizeCsvTextCell'),
  extractFunction('csvCellValue'),
  extractFunction('buildFindingsCsv')
].join('\n');

const ctx = {};
vm.createContext(ctx);
vm.runInContext(source, ctx);

const { sanitizeCsvTextCell, csvCellValue, buildFindingsCsv } = ctx;

assert.equal(sanitizeCsvTextCell('normal text'), 'normal text');
assert.equal(sanitizeCsvTextCell('=2+2'), "'=2+2");
assert.equal(sanitizeCsvTextCell('+SUM(A1:A2)'), "'+SUM(A1:A2)");
assert.equal(sanitizeCsvTextCell('-10+5'), "'-10+5");
assert.equal(sanitizeCsvTextCell('@cmd'), "'@cmd");
assert.equal(sanitizeCsvTextCell(' \t=calc'), "' \t=calc");
assert.equal(sanitizeCsvTextCell('\r\n@hidden'), "'\r\n@hidden");
assert.equal(sanitizeCsvTextCell('éèà'), 'éèà');

assert.equal(csvCellValue('a"b'), '"a""b"');
assert.equal(csvCellValue('line1\nline2'), '"line1\nline2"');
assert.equal(csvCellValue('=A1'), '"\'=A1"');
assert.equal(csvCellValue(true), '"true"');
assert.equal(csvCellValue(42), '"42"');

const findings = [
  {
    type: 'network-out',
    file: 'src/a.js',
    line: 7,
    target: '=HYPERLINK("http://x")',
    severity: 'high',
    external: true,
    outside: false,
    subtype: '+test',
    code: '@danger\nnext'
  },
  {
    type: 'db-query',
    file: 'src/b.sql',
    line: '',
    target: 'ok',
    severity: 'medium',
    external: false,
    outside: false,
    subtype: '',
    code: 'SELECT "a";'
  }
];

const csv = buildFindingsCsv(findings);
assert.ok(csv.startsWith('"type";"file";"line";"target";"severity";"external";"outside";"subtype";"code"\n'));
assert.ok(csv.includes('"\'=HYPERLINK(""http://x"")"'));
assert.ok(csv.includes('"\'+test"'));
assert.ok(csv.includes('"\'@danger\nnext"'));
assert.ok(csv.includes('"SELECT ""a"";"'));

assert.equal(findings[0].target, '=HYPERLINK("http://x")');
assert.equal(findings[0].subtype, '+test');
assert.equal(findings[0].code, '@danger\nnext');

console.log('OK: flux CSV export sanitization tests passed');
