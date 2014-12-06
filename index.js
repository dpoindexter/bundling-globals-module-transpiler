var libpath = require('path');
var libfs = require('fs');
var libmodule = require('module');
var ModuleClass = require('es6-module-transpiler/lib/module');

// console.log("libpath should be below this.")
// console.log(libpath)
// console.log("libpath should be above this.")
// console.log("--------------------------------------------------------------------------------------")
// console.log("libfs should be below this.")
// console.log(libfs)
// console.log("libfs should be above this.")
// console.log("--------------------------------------------------------------------------------------")
// console.log("libmodule should be below this.")
// console.log(libmodule)
// console.log("libmodule should be above this.")
// console.log("--------------------------------------------------------------------------------------")
// console.log("ModuleClass should be below this.")
// console.log(ModuleClass)
// console.log("ModuleClass should be above this.")
// console.log("--------------------------------------------------------------------------------------")
// console.log("libmodule._resolveFilename should be below this.")
// console.log(libmodule._resolveFilename)
// console.log("libmodule._resolveFilename should be above this.")

function MyFileResolver(paths) {
  this.rootPath = (paths && paths.length ? paths[0] : process.cwd());
}


MyFileResolver.prototype.resolveModule = function (importedPath, fromModule) {
  if (importedPath.charAt(0) !== '.') {
    console.log('INFO: External module detected: "%s"', importedPath);
    var resolvedPath = this.resolvePath(importedPath, fromModule);
    if (resolvedPath) {
      var cachedModule = container.getCachedModule(resolvedPath);
      if (cachedModule) {
        return cachedModule;
      } else {
        console.log('INFO: External module found at: "%s"', resolvedPath);
        return new ModuleClass(resolvedPath, importedPath, container);
      }
    }
  }
  return null;
};

MyFileResolver.prototype.resolvePath = function(importedModuleName, fromModule) {
  var main, resolved,
    parentPackagePath = this.resolvePackage(fromModule ? fromModule.path : this.rootPath),
    packagePath, pkg;

  if (!parentPackagePath) {
    console.error('ERROR: Parent module not found for: "%s"', importedModuleName);
    return null;
  }

  try {
    packagePath = this.resolvePackage(libmodule._resolveFilename(importedModuleName, libmodule._cache[parentPackagePath]));
  } catch (e1) {
    console.error('ERROR: Unable to resolve package information for module: "%s"', importedModuleName);
    return null;
  }

  try {
    pkg = require(packagePath);
    main = pkg["jsnext:main"].toString();
  } catch (e) {
    console.error('ERROR: External module without "jsnext:main" directive at: "%s"', importedModuleName);
    return null;
  }

  resolved = libpath.resolve(libpath.dirname(packagePath), main);
  if (libfs.existsSync(resolved)) {
    return resolved;
  }

  console.error('ERROR: Lookup fails for module "%s" at "%s"', importedModuleName, resolved);
  return null;
};

MyFileResolver.prototype.resolvePackage = function (modulePath) {
  var paths = libmodule._nodeModulePaths(libpath.dirname(modulePath)),
    i, p;

  for (i = 0; i < paths.length; i++) {
    p = libpath.resolve(paths[i], '../package.json');
    if (libfs.existsSync(p)) {
      require(p);
      return p;
    }
  }

  return null;
};

module.exports = MyFileResolver;