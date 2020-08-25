'use strict';

const childProcess = require('child_process');

const CONFIG = require('../config');

module.exports = function(ci) {
  console.log('Installing apm');
  // npm ci leaves apm with a bunch of unmet dependencies
  childProcess.execFileSync(
    CONFIG.getNpmBinPath(),
    ['--global-style', '--loglevel=error', 'install', ci ? '--no-save' : ''],
    { env: process.env, cwd: CONFIG.apmRootPath }
  );
};
