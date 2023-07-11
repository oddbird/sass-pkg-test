// @ts-check
const assert = require('node:assert');
const pkgResolution = require('./pkg-resolution');
const line = () => console.log('\n\n====================');

/** @typedef {[string, string|null]} TestCase */

/** @param {TestCase} testCase  */
function checkExample([pkgPath, expectedResolvedPath]) {
  let res = pkgResolution(pkgPath);

  // For testing, simplify the path
  if (res) res = res.split('sass-pkg-test')[1];

  assert(
    res === expectedResolvedPath,
    `${pkgPath}: expected ${expectedResolvedPath}, got ${res}`,
  );
  console.log(`pkg:${pkgPath} > ${res}`);
}

console.log('Tests against the proposed pkg resolution algorithm.');
console.log(
  'See `index.js` for comments, `node_modules` for mocked dependencies',
);

line();
console.log('foo - simple module with no exports, "main" is in root\n');
/** @type TestCase[] */
const fooCases = [
  ['foo', '/node_modules/foo/index.scss'],
  ['foo/_index.scss', '/node_modules/foo/_index.scss'],
  ['foo/dist/scss', '/node_modules/foo/dist/scss'],
  ['foo/dist/scss/foo', '/node_modules/foo/dist/scss/foo'],
  ['foo/dist/scss/_index.scss', '/node_modules/foo/dist/scss/_index.scss'],
];
fooCases.forEach(checkExample);

line();
console.log('conditional-sass - "sass" condition defined');
/** @type TestCase[] */
const conditionalSassCases = [
  ['conditional-sass', '/node_modules/conditional-sass/scss/styles.scss']
]
conditionalSassCases.forEach(checkExample);

line();
console.log('conditional-style - "style" condition defined');
/** @type TestCase[] */
const conditionalStyleCases = [
  ['conditional-style', '/node_modules/conditional-style/css/styles.css']
]
conditionalStyleCases.forEach(checkExample);

line();
console.log('conditional-order - "sass" condition defined *last*');
console.log('                    returns index and NOT path defined in index');
/** @type TestCase[] */
const conditionalOrderCases = [
  ['conditional-order', '/node_modules/conditional-order/index.scss']
]
conditionalOrderCases.forEach(checkExample);

line();
console.log('root-sass - "sass" key defined');
/** @type TestCase[] */
const rootSassCases = [
  ['root-sass', '/node_modules/root-sass/scss/styles.scss']
]
rootSassCases.forEach(checkExample);

line();
console.log('root-style - "style" key defined');
/** @type TestCase[] */
const rootStyleCases = [
  ['root-style', '/node_modules/root-style/css/styles.css']
]
rootStyleCases.forEach(checkExample);

line();
console.log('root-index - index file in root directory');
/** @type TestCase[] */
const rootIndexCases = [
  ['root-index', '/node_modules/root-index/index.scss']
]
rootIndexCases.forEach(checkExample);

line();
console.log('@bar/foo - namespaced module name\n');
/** @type TestCase[] */
const barFooCases = [
  ['@bar/foo', '/node_modules/@bar/foo/_index.scss'],
  ['@bar/foo/dist/styles.scss', '/node_modules/@bar/foo/dist/styles.scss'],
];
barFooCases.forEach(checkExample);

line();
console.log('badImport - a module that does not exist\n');
/** @type TestCase[] */
const badImportCases = [
  ['badImport', null],
  ['badImport/styles.scss', null],
];
badImportCases.forEach(checkExample);

line();
console.log('no-package - a package missing a package.json file\n');
/** @type TestCase[] */
const noPackageCases = [
  ['no-package', null],
  // Without a package.json, we can't resolve the root path
  ['no-package/_index.scss', null],
];
noPackageCases.forEach(checkExample);
