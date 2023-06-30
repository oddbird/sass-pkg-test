// @ts-check
// This is a minimal representation of the "Resolving a `pkg:` URL" algorithm from the Package Import proposal.
const path = require('path');

function getDependencyName(full) {
    if (full.startsWith('@')) {
        let parts = full.split('/');
        return [parts[0], parts[1]].join('/')
    }
    else return full.split('/')[0]
}
module.exports = (pkgPath) => {
    let resolved;
    try {
        // 1. Let `resolved` be the result of the implementation's dependency resolution alogrithm.
        resolved = require.resolve(pkgPath)
    } catch (error) {
        // 2. If resolution fails, resolve the dependency default, and let resolved be the path to the dependency default's directory, appended with the subpath of `url`  
        try {
            const dependencyName = getDependencyName(pkgPath);
            let pathToDependency = require.resolve(dependencyName);
            pathToDependency = path.dirname(pathToDependency);
            resolved = pathToDependency + pkgPath.replace(dependencyName, '');
        } catch (error) {
            // Dependency not found
            // 3. If `resolved` is unknown, return null.
            return null;
        }
    }
    // 4. If `resolved` is a directory or a file with extension of scss, sass, or css, return it. Otherwise:
    if (['.scss', '.sass', '.css', ''].includes(path.extname(resolved))) {
        return resolved;
    }
    // 5. If `resolved` is a file with a name that is different than the name of url, return the file's containing directory.
    if (path.basename(pkgPath) !== path.basename(resolved)) {
        return path.dirname(resolved)
    }
    // 6. Return null.
    return null;
}