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

// This is a nonnormative function 
// Notably it doesn't handle nested packages
function getPackageRoot(pkgPath, previousURL) {
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
  return { packageManifest: require(packagePath + '/package.json'), packagePath: packagePath };
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

// Implementation of procedure "Resolving package root values"
function resolvingPackageRootValues(packagePath, packageManifest) {
  let sassValue = packageManifest.sass;
  if (sassValue) {
    sassValue = sassValue.replace(/^\.\//, '');
    return `${packagePath}/${sassValue}`;
  }
  let styleValue = packageManifest.style;
  if (styleValue) {
    styleValue = styleValue.replace(/^\.\//, '');
    return `${packagePath}/${styleValue}`;
  }

  // @todo Handle partials and other extensions
  else return `${packagePath}/index.scss`
}

// Implementation of procedure "Node Algorithm for Resolving a `pkg:` URL"
module.exports = (url, previousURL) => {
  const fullPath = new URL(url).pathname;
  const packageName = resolvingAPackageName(fullPath);

  let subPath = fullPath.replace(packageName, '');
  const packageRoot = getPackageRoot(packageName, previousURL);

  const { packageManifest, packagePath } = getPackagePackage(fullPath);
  if (!packageManifest || !packagePath) return null;

  // 1. `sass` condition in package.json `exports`
  let sassCondition = resolveWithCondition(packageManifest, fullPath, 'sass');
  if (sassCondition) {
    sassCondition = sassCondition.filter(hasAnyValidExtension);
    if (sassCondition.length) {
      return path.resolve(packagePath, sassCondition[0]);
    }
  }

  // 2. `style` condition in package.json `exports`
  let styleCondition = resolveWithCondition(packageManifest, fullPath, 'style');
  if (styleCondition) {
    styleCondition = styleCondition.filter(hasAnyValidExtension);
    if (styleCondition.length) {
      return path.resolve(packagePath, styleCondition[0]);
    }
  }
  if (!subPath) {
    return resolvingPackageRootValues(packagePath, packageManifest);
  } else {
    subPath = subPath.replace(/^\//,'');
    const resolved = new URL(subPath, 'file://' + packageRoot + '/');
    return resolved.toString();
  }
}
