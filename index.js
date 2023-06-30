// @ts-check
const assert = require('node:assert');
const pkgResolution = require('./pkg-resolution');
const line = () => console.log('\n\n====================')

function checkExample([pkgPath, expectedResolvedPath]) {
    let res = pkgResolution(pkgPath);

    // For testing, simplify the path 
    if (res) res = res.split('sass-pkg-test')[1]

    assert(res === expectedResolvedPath, `${pkgPath}: expected ${expectedResolvedPath}, got ${res}`);
    console.log(`pkg:${pkgPath} > ${res}`);
}

console.log('Tests against the proposed pkg resolution algorithm.');
console.log('See `index.js` for comments, `node_modules` for mocked dependencies');


line();
console.log('foo - simple module with no exports, "main" is in root\n');
[
    ["foo", "/node_modules/foo"],
    // Attempting to load a non-valid file will fail
    ["foo/index.js", null],
    // foo/index resolves to foo/index.js. Since this is not a valid file, and a different path than expected, return the directory
    ["foo/index", "/node_modules/foo"],
    ["foo/_index.scss", "/node_modules/foo/_index.scss"],
    ["foo/dist/scss", '/node_modules/foo/dist/scss'],
    ["foo/dist/scss/foo", '/node_modules/foo/dist/scss/foo'],
    ["foo/dist/scss/_index.scss", '/node_modules/foo/dist/scss/_index.scss']
].forEach(example => checkExample(example))


line();
console.log('fooExport - module defines its exports in package.json');
[
    // default export is in dist, so this algorithm resolves to that folder
    ["fooExport", '/node_modules/fooExport/dist/js'],
    // _styles.scss is the export, so styles (or _styles or styles.scss) resolve to the default export, and then append their path
    // This shows the initial pkg resolution step does not handle partials or index files
    ["fooExport/styles", '/node_modules/fooExport/dist/js/styles'],
    ["fooExport/_styles", '/node_modules/fooExport/dist/js/_styles'],
    ["fooExport/styles.scss", '/node_modules/fooExport/dist/js/styles.scss'],
    // _styles.scss is a subpath export, so resolves to an exact file
    ["fooExport/_styles.scss", '/node_modules/fooExport/dist/scss/_index.scss']
].forEach(example => checkExample(example))

line();
console.log('@bar/foo - namespaced module name\n');
[["@bar/foo", '/node_modules/@bar/foo']].forEach(example => checkExample(example))

line();
console.log('badImport - a module that does not exist\n');
[
    ["badImport", null],
    ["badImport/styles.scss", null],
].forEach(example => checkExample(example))




