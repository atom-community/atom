'use strict';

const childProcess = require('child_process');

const CONFIG = require('../config');

module.exports = function(packagePath, ci, stdioOptions) {
  childProcess.execFileSync(CONFIG.getApmBinPath(), [ci ? 'ci' : 'install'], {
    // Set resource path so that apm can load metadata related to Atom.
    env: { ...process.env, ATOM_RESOURCE_PATH: CONFIG.repositoryRootPath },
    cwd: packagePath,
    stdio: stdioOptions || 'inherit'
  });
};
