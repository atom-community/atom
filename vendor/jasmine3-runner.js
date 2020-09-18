const { createRunner } = require("atom-jasmine3-test-runner");

// https://github.com/UziTech/atom-jasmine3-test-runner#api
module.exports = createRunner({
  suffix: "-spec-v3",
  legacySuffix: "-spec",
  testPackages: [],
  timeReporter: true,
  specHelper: true,
});
