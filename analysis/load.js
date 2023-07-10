const packages = require('./packages');
const fs = require('fs');

const REFETCH = false;

function log(){
    console.log(...arguments)
}

var myHeaders = new Headers();
// myHeaders.append("Accept", "application/vnd.npm.install-v1+json");

var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
};

function processPackage(pkg) {
    const latest = pkg['dist-tags'].latest;
    const latestPkg = pkg.versions[latest];
    const dropKeys = ['dependencies', 'devDependencies', 'scripts'];
    dropKeys.forEach(key => {
        delete latestPkg[key];
    })
    return latestPkg;
}

function writePackage(pkg) {
    fs.writeFileSync(`data/${safeName(pkg.name)}.json`, JSON.stringify(pkg));
}
function safeName(name){
    return name.replace('/', '__');
}
packages.forEach(async package => {
    if (!REFETCH) {
        try {
            const data = require.resolve(`./data/${safeName(package)}.json`);
            log('skip ' + package);
            return;
        } catch (error) {
            
        }
    }
    fetch("https://registry.npmjs.org/" + package, requestOptions)
        .then(response => response.json())
        .then(response=>{if(response.error) log(error, package); return response;})
        .then(processPackage)
        .then(writePackage)
        .then(()=>{log('wrote '+ package)})
        .catch(error => {
            console.log('error', error)
        })
            ;

})

