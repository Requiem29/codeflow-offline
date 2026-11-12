import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const JSZip = require('../src/vendor/jszip.min.js');
const fluxPath = new URL('../src/flux.html', import.meta.url);
const html = fs.readFileSync(fluxPath, 'utf8');

function extractFunction(name) {
  const asyncSignature = `async function ${name}(`;
  const signature = `function ${name}(`;
  let start = html.indexOf(asyncSignature);
  if (start === -1) start = html.indexOf(signature);
  if (start === -1) throw new Error(`Function not found: ${name}`);
  let depth = 0;
  let bodyStart = -1;
  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (ch === '{') {
      if (bodyStart === -1) bodyStart = i;
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0 && bodyStart !== -1) return html.slice(start, i + 1);
    }
  }
  throw new Error(`Malformed function: ${name}`);
}

const functions = [
  'norm', 'fname', 'folder', 'ext', 'isText', 'skip', 'readZip',
  'sanitizeCsvTextCell', 'csvCellValue', 'buildFindingsCsv', 'exportData'
];
const downloaded = [];
const state = {
  files: [{ path: '=suspicious.js', name: '=suspicious.js', folder: 'root', size: 11 }],
  findings: [{
    type: 'network-out', file: 'src/a.js', line: 7,
    target: '=HYPERLINK("http://x")', severity: 'high',
    external: true, outside: false, subtype: '+test', code: '@danger\nnext'
  }, {
    type: 'db-query', file: 'src/b.sql', line: '',
    target: 'ok', severity: 'medium', external: false, outside: false,
    subtype: '', code: 'SELECT "a";'
  }],
  flows: [{ entry: 'test', files: ['src/a.js'], target: null, complete: false }],
  services: [{ type: 'db-connection', target: 'example' }]
};
const ctx = {
  JSZip,
  IGNORE: new Set(['node_modules', '.git', 'vendor', 'dist', 'build']),
  STATE: state,
  Blob,
  msg() {},
  document: {
    createElement(tag) {
      assert.equal(tag, 'a');
      return { click() {} };
    }
  },
  URL: {
    createObjectURL(blob) {
      downloaded.push(blob);
      return 'blob:test';
    },
    revokeObjectURL() {}
  }
};
vm.createContext(ctx);
vm.runInContext(functions.map(extractFunction).join('\n'), ctx);

const { sanitizeCsvTextCell, csvCellValue, buildFindingsCsv, readZip, exportData } = ctx;

assert.equal(sanitizeCsvTextCell('normal text'), 'normal text');
assert.equal(sanitizeCsvTextCell('=2+2'), "'=2+2");
assert.equal(sanitizeCsvTextCell('+SUM(A1:A2)'), "'+SUM(A1:A2)");
assert.equal(sanitizeCsvTextCell('-10+5'), "'-10+5");
assert.equal(sanitizeCsvTextCell('@cmd'), "'@cmd");
assert.equal(sanitizeCsvTextCell(' \t=calc'), "' \t=calc");
assert.equal(sanitizeCsvTextCell('\r\n@hidden'), "'\r\n@hidden");
assert.equal(sanitizeCsvTextCell('\uFEFF=hidden'), "'\uFEFF=hidden");
assert.equal(sanitizeCsvTextCell('éèà'), 'éèà');

assert.equal(csvCellValue('a"b'), '"a""b"');
assert.equal(csvCellValue('line1\nline2'), '"line1\nline2"');
assert.equal(csvCellValue('=A1'), '"\'=A1"');
assert.equal(csvCellValue(true), '"true"');
assert.equal(csvCellValue(42), '"42"');

const csv = buildFindingsCsv(state.findings);
assert.ok(csv.startsWith('"type";"file";"line";"target";"severity";"external";"outside";"subtype";"code"\n'));
assert.ok(csv.includes('"\'=HYPERLINK(""http://x"")"'));
assert.ok(csv.includes('"\'+test"'));
assert.ok(csv.includes('"\'@danger\nnext"'));
assert.ok(csv.includes('"SELECT ""a"";"'));

const before = JSON.stringify(state);
exportData('csv');
assert.equal(await downloaded.pop().text(), csv);
exportData('json');
const json = JSON.parse(await downloaded.pop().text());
assert.deepEqual(json.files, state.files);
assert.deepEqual(json.findings, state.findings);
assert.deepEqual(json.flows, state.flows);
assert.deepEqual(json.services, state.services);
assert.match(json.generatedAt, /^\d{4}-\d{2}-\d{2}T/);
assert.equal(JSON.stringify(state), before, 'CSV and JSON export must not mutate source state');

// Exercise the real ZIP reader with malicious names and contents, then
// serialize the resulting values through the production CSV serializer.
const zip = new JSZip();
zip.file('=HYPERLINK(1).js', '=2+2\n');
zip.file('safe.js', '@danger\n');
const archive = await zip.generateAsync({ type: 'nodebuffer' });
const entries = await readZip(archive);
assert.equal(entries.length, 2);
assert.ok(entries.some(e => e.path === '=HYPERLINK(1).js'));
assert.ok(entries.some(e => e.content === '@danger\n'));
const csvFromZip = buildFindingsCsv(entries.map(e => ({
  type: 'network-out', file: e.path, line: 1,
  target: e.content, severity: 'high', external: true,
  outside: false, subtype: '', code: e.content
})));
assert.ok(csvFromZip.includes('"\'=HYPERLINK(1).js"'));
assert.ok(csvFromZip.includes('"\'=2+2\n"'));
assert.ok(csvFromZip.includes('"\'@danger\n"'));

console.log('OK: CSV formulas, ZIP input, JSON export, and source immutability');
