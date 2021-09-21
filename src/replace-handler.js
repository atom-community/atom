/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {PathReplacer} = require('scandal');

module.exports = function(filePaths, regexSource, regexFlags, replacementText) {
  const callback = this.async();

  const replacer = new PathReplacer();
  const regex = new RegExp(regexSource, regexFlags);

  replacer.on('file-error', ({code, path, message}) => emit('replace:file-error', {code, path, message}));

  replacer.on('path-replaced', result => emit('replace:path-replaced', result));

  return replacer.replacePaths(regex, replacementText, filePaths, () => callback());
};
