// @ts-check
const fs = require('fs')
const path = require('path')

class Counter {
    items = {};
    constructor() {
        this.items = {}
    }

    inc(item) {
        if (!this.items[item]) this.items[item] = 0;
        this.items[item] = this.items[item] + 1;
    }
    toString(){
        return JSON.stringify(this.items)
    }
}
function isString(any) {
    return typeof any === 'string'
}
function isRelative(obj) {
    if (!obj) return false;
    const item = Object.keys(obj)[0];
    return !!(item?.startsWith('./'))
}
function isConditional(obj) {
    return !isRelative(obj);
}

const fullPath = path.join(__dirname, 'data')

const files = fs.readdirSync(fullPath).filter(file=>fileExtension(file) === '.json');
const database = files.map(file => {
    if(file.startsWith('.')) return;
    const fileData = fs.readFileSync(path.join('./data', file));
    const json = JSON.parse(fileData.toString());
    return json;
});

console.log('Analyzing ' + database.length + ' package.json files');

// root keys
function rootKeyMap(pkg, key) {
    return { name: pkg.name, [key]: pkg[key] }
}
const rootKeys = {
    sass: database.filter(pkg => 'sass' in pkg).map(pkg => rootKeyMap(pkg, 'sass')),
    style: database.filter(pkg => 'style' in pkg).map(pkg => rootKeyMap(pkg, 'style')),
    styles: database.filter(pkg => 'styles' in pkg).map(pkg => rootKeyMap(pkg, 'styles')),

}
console.log('Keys set on the package.json root', rootKeys)

function unique(value, index, array) {
    return array.indexOf(value) === index;
}
// root key list
const rootKeyList = [...database.flatMap(Object.keys)].filter(unique);
console.log('list of all keys set at the root');
console.log(JSON.stringify(rootKeyList))

function fileExtension(file) {
    if (!file) return undefined;
    return path.extname(file);
}
// file types for main
const mainTypeCounter = new Counter();
const mainTypes = database.map(pkg => pkg.main).map(fileExtension);
mainTypes.forEach((type) => mainTypeCounter.inc(type))
console.log('main file types', mainTypeCounter)

// file types for module
const moduleTypeCounter = new Counter();
const moduleTypes = database.map(pkg => pkg.module).map(fileExtension);
moduleTypes.forEach((type) => moduleTypeCounter.inc(type))
console.log('module file types', moduleTypeCounter)


// exports
const exported = database.map(a => a.exports);
// If string, what is extension
const stringCounter = new Counter();
exported.filter(isString).map(fileExtension).forEach(t => stringCounter.inc(t))
console.log('string exports', stringCounter);

const fromCounter = new Counter();
const toCounter = new Counter();

function walkExports(exportVal) {
    if (!exportVal) return;
    if (Array.isArray(exportVal)) exportVal.forEach(walkExports);
    if (typeof exportVal === 'string') {
        toCounter.inc(fileExtension(exportVal))
    }
    else {
        Object.keys(exportVal).forEach(key => {
            fromCounter.inc(key);
            if (typeof exportVal[key] === 'string') {
                toCounter.inc(fileExtension(key));
            } else {
                walkExports(exportVal[key])
            }
        })
    }
}

exported.filter(isConditional).forEach(walkExports);
console.log('fromCounter', fromCounter)
console.log('toCounter- extensions', toCounter)