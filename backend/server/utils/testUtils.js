const path = require('path');

const SandboxedModule = require('sandboxed-module');

// Shorthand for hasOwnProperty that also works with bare objects
const hasProp = (obj, prop) => Object.prototype.hasOwnProperty.bind(obj)(prop);

module.exports.sandBox = (fileName, params, ...args) => {
  const resolvedFileName = path.resolve(__dirname, '..', '..', fileName);

  return SandboxedModule.require(resolvedFileName, params, ...args);
};

// Convieniece function to throw an error is an unmocked dependancy is used
module.exports.wrapRequire = (modules) =>
  new Proxy(require, {
    apply: (target, self, args) => {
      const moduleName = args[0];

      if (!hasProp(modules, moduleName)) {
        throw new Error(`Non mocked module required: ${moduleName}`);
      }

      return modules[moduleName];
    },
  });

module.exports.mockDate = (year, month, day) =>
  new Proxy(Date, {
    construct(Target, args) {
      return new Target(year, month, day);
    },
  });
