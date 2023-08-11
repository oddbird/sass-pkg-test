// @ts-check
// This is a minimal representation of the "Resolving a `pkg:` URL" algorithm from the Package Import proposal.
const path = require('path');
const resolveExports = require('resolve.exports');

// Implementation of procedure `Resolving a package name`
function resolvingAPackageName(path) {
  if (path.startsWith('@')) {
    let parts = path.split('/');
    return [parts[0], parts[1]].join('/');
  } else return path.split('/')[0];
}

function getPackageRoot(pkgPath) {
  const packageName = resolvingAPackageName(pkgPath);
  let path;
  try {
    path = require.resolve(packageName);
  } catch (error) {

  }
  const root = path?.split(packageName)[0];
  if (!root) return;
  return root + packageName;
}
// This is an nonnormative function that doesn't handle edge cases.
function getPackagePackage(pkgPath) {
  const root = getPackageRoot(pkgPath);
  if (!root) return { packageJSON: null, packagePath: null };
  const packagePath = root;
  return { packageJSON: require(packagePath + '/package.json'), packagePath: packagePath };
}

function hasAnyValidExtension(file) {
  return ['.scss', '.sass', '.css'].includes(path.extname(file));
}

function resolveWithCondition(packageJSON, pkgPath, condition) {
  try {
    return resolveExports.exports(packageJSON, pkgPath, { conditions: [condition] })
  } catch (error) {
    return undefined;
  }
}
module.exports = (pkgPath) => {
  const { packageJSON, packagePath } = getPackagePackage(pkgPath);
  if (!packageJSON || !packagePath) return null;

  // 1. `sass` condition in package.json `exports`
  let sassCondition = resolveWithCondition(packageJSON, pkgPath, 'sass');
  if (sassCondition) {
    sassCondition = sassCondition.filter(hasAnyValidExtension);
    if (sassCondition.length) {
      return path.resolve(packagePath, sassCondition[0]);
    }
  }
  // 2. `style` condition in package.json `exports`
  let styleCondition = resolveWithCondition(packageJSON, pkgPath, 'style');
  if (styleCondition) {
    styleCondition = styleCondition.filter(hasAnyValidExtension);
    if (styleCondition.length) {
      return path.resolve(packagePath, styleCondition[0]);
    }
  }
  // 3. If no subpath, then find root export-
  if (resolvingAPackageName(pkgPath) === pkgPath) {
    //   1. `sass` key at package.json root (sass, scss, or css)
    if (packageJSON.sass) return path.resolve(packagePath, packageJSON.sass);
    //   2. `style` key at package.json root (css only)
    if (packageJSON.style) return path.resolve(packagePath, packageJSON.style);
    //   3. `index` file at package root, resolved for file extensions and partials
    // @TODO resolve extensions and partials
    return path.resolve(packagePath, 'index.scss')
  } else {
    // 1. If there is a subpath, resolve that path relative to the package root, and
    //    resolve for file extensions and partials  
    // @TODO resolve extensions and partials
    const subpath = pkgPath.replace(resolvingAPackageName(pkgPath) + '/', '');
    return path.resolve(packagePath, subpath);
  }
};
