/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require("path");
const async = require("async");
const {PathSearcher, PathScanner, search} = require('scandal');

module.exports = function(rootPaths, regexSource, options, searchOptions) {
  if (searchOptions == null) { searchOptions = {}; }
  const callback = this.async();

  const PATHS_COUNTER_SEARCHED_CHUNK = 50;
  let pathsSearched = 0;

  const searcher = new PathSearcher(searchOptions);

  searcher.on('file-error', ({code, path, message}) => emit('scan:file-error', {code, path, message}));

  searcher.on('results-found', result => emit('scan:result-found', result));

  let flags = "g";
  if (options.ignoreCase) { flags += "i"; }
  const regex = new RegExp(regexSource, flags);

  return async.each(
    rootPaths,
    function(rootPath, next) {
      const options2 = Object.assign({}, options, {
        inclusions: processPaths(rootPath, options.inclusions),
        globalExclusions: processPaths(rootPath, options.globalExclusions)
      }
      );

      const scanner = new PathScanner(rootPath, options2);

      scanner.on('path-found', function() {
        pathsSearched++;
        if ((pathsSearched % PATHS_COUNTER_SEARCHED_CHUNK) === 0) {
          return emit('scan:paths-searched', pathsSearched);
        }
      });

      return search(regex, scanner, searcher, function() {
        emit('scan:paths-searched', pathsSearched);
        return next();
      });
    },
    callback
  );
};

var processPaths = function(rootPath, paths) {
  if (!((paths != null ? paths.length : undefined) > 0)) { return paths; }
  const rootPathBase = path.basename(rootPath);
  const results = [];
  for (let givenPath of Array.from(paths)) {
    const segments = givenPath.split(path.sep);
    const firstSegment = segments.shift();
    results.push(givenPath);
    if (firstSegment === rootPathBase) {
      if (segments.length === 0) {
        results.push(path.join("**", "*"));
      } else {
        results.push(path.join(...Array.from(segments || [])));
      }
    }
  }
  return results;
};
