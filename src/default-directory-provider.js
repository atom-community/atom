/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let DefaultDirectoryProvider;
const {Directory} = require('pathwatcher');
const fs = require('fs-plus');
const path = require('path');
const url = require('url');

module.exports =
(DefaultDirectoryProvider = class DefaultDirectoryProvider {

  // Public: Create a Directory that corresponds to the specified URI.
  //
  // * `uri` {String} The path to the directory to add. This is guaranteed not to
  // be contained by a {Directory} in `atom.project`.
  //
  // Returns:
  // * {Directory} if the given URI is compatible with this provider.
  // * `null` if the given URI is not compatible with this provider.
  directoryForURISync(uri) {
    const normalizedPath = this.normalizePath(uri);
    const {host} = url.parse(uri);
    const directoryPath = host ?
      uri
    : !fs.isDirectorySync(normalizedPath) && fs.isDirectorySync(path.dirname(normalizedPath)) ?
      path.dirname(normalizedPath)
    :
      normalizedPath;

    // TODO: Stop normalizing the path in pathwatcher's Directory.
    const directory = new Directory(directoryPath);
    if (host) {
      directory.path = directoryPath;
      if (fs.isCaseInsensitive()) {
        directory.lowerCasePath = directoryPath.toLowerCase();
      }
    }
    return directory;
  }

  // Public: Create a Directory that corresponds to the specified URI.
  //
  // * `uri` {String} The path to the directory to add. This is guaranteed not to
  // be contained by a {Directory} in `atom.project`.
  //
  // Returns a {Promise} that resolves to:
  // * {Directory} if the given URI is compatible with this provider.
  // * `null` if the given URI is not compatible with this provider.
  directoryForURI(uri) {
    return Promise.resolve(this.directoryForURISync(uri));
  }

  // Public: Normalizes path.
  //
  // * `uri` {String} The path that should be normalized.
  //
  // Returns a {String} with normalized path.
  normalizePath(uri) {
    // Normalize disk drive letter on Windows to avoid opening two buffers for the same file
    let matchData;
    const pathWithNormalizedDiskDriveLetter =
      (process.platform === 'win32') && (matchData = uri.match(/^([a-z]):/)) ?
        `${matchData[1].toUpperCase()}${uri.slice(1)}`
      :
        uri;
    return path.normalize(pathWithNormalizedDiskDriveLetter);
  }
});
