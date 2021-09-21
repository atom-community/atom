const url = require("url")

// Package helpers
// Parse the repository in `name/owner` format from the package metadata.
//
// pack - The package metadata object.
//
// Returns a name/owner string or null if not parseable.
var getRepository = module.exports.getRepository = function getRepository(pack = {}) {
  let repository
  if ((repository = (pack.repository && (pack.repository.url != null)) ? pack.repository.url : pack.repository)) {
    const repoPath = url.parse(repository.replace(/\.git$/, "")).pathname
    const [name, owner] = Array.from(repoPath.split("/").slice(-2))
    if (name && owner) {
      return `${name}/${owner}`
    }
  }
  return null
}

// Determine remote from package metadata.
//
// pack - The package metadata object.
// Returns a the remote or 'origin' if not parseable.
var getRemote = module.exports.getRemote = function getRemote(pack = {}) {
  return (pack.repository && pack.repository.url) || pack.repository || "origin"
}
