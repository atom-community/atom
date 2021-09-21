const child_process = require("child_process")
const fs = require("fysh")
const path = require("path")
const npm = require("npm")
let asarPath = null

var getHomeDirectory = module.exports.getHomeDirectory = function getHomeDirectory() {
  if (process.platform === "win32") {
    return process.env.USERPROFILE
  } else {
    return process.env.HOME
  }
}

var getAtomDirectory = module.exports.getAtomDirectory = function getAtomDirectory() {
  return process.env.ATOM_HOME != null ? process.env.ATOM_HOME : path.join(getHomeDirectory(), ".atom")
}

var getRustupHomeDirPath = module.exports.getRustupHomeDirPath = function getRustupHomeDirPath() {
  if (process.env.RUSTUP_HOME) {
    return process.env.RUSTUP_HOME
  } else {
    return path.join(getHomeDirectory(), ".multirust")
  }
}

var getCacheDirectory = module.exports.getCacheDirectory = function getCacheDirectory() {
  return path.join(getAtomDirectory(), ".apm")
}

var getResourcePath = module.exports.getResourcePath = function getResourcePath(callback) {
  if (process.env.ATOM_RESOURCE_PATH) {
    return process.nextTick(() => callback(process.env.ATOM_RESOURCE_PATH))
  }

  if (asarPath) {
    // already calculated
    return process.nextTick(() => callback(asarPath))
  }

  let apmFolder = path.resolve(__dirname, "..")
  let appFolder = path.dirname(apmFolder)
  if (path.basename(apmFolder) === "apm" && path.basename(appFolder) === "app") {
    asarPath = `${appFolder}.asar`
    if (fs.existsSync(asarPath)) {
      return process.nextTick(() => callback(asarPath))
    }
  }

  apmFolder = path.resolve(__dirname, "..", "..", "..")
  appFolder = path.dirname(apmFolder)
  if (path.basename(apmFolder) === "apm" && path.basename(appFolder) === "app") {
    asarPath = `${appFolder}.asar`
    if (fs.existsSync(asarPath)) {
      return process.nextTick(() => callback(asarPath))
    }
  }

  let glob, pattern, asarPaths

  switch (process.platform) {
    case "darwin":
      return child_process.exec(
        "mdfind \"kMDItemCFBundleIdentifier == 'com.github.atom'\"",
        function (error, stdout = "") {
          let appLocation
          if (!error) {
            ;[appLocation] = Array.from(stdout.split("\n"))
          }
          if (!appLocation) {
            appLocation = "/Applications/Atom.app"
          }
          asarPath = `${appLocation}/Contents/Resources/app.asar`
          return process.nextTick(() => callback(asarPath))
        }
      )
    case "linux":
      asarPath = "/usr/local/share/atom/resources/app.asar"
      if (!fs.existsSync(asarPath)) {
        asarPath = "/usr/share/atom/resources/app.asar"
      }
      return process.nextTick(() => callback(asarPath))
    case "win32":
      glob = require("glob")
      pattern = `/Users/${process.env.USERNAME}/AppData/Local/atom/app-+([0-9]).+([0-9]).+([0-9])/resources/app.asar`
      asarPaths = glob.sync(pattern, null) // [] | a sorted array of locations with the newest version being last
      asarPath = asarPaths[asarPaths.length - 1]
      return process.nextTick(() => callback(asarPath))
    default:
      return process.nextTick(() => callback(""))
  }
}

var getReposDirectory = module.exports.getReposDirectory = function getReposDirectory() {
  return process.env.ATOM_REPOS_HOME != null ? process.env.ATOM_REPOS_HOME : path.join(getHomeDirectory(), "github")
}

var getElectronUrl = module.exports.getElectronUrl = function getElectronUrl() {
  return process.env.ATOM_ELECTRON_URL != null ? process.env.ATOM_ELECTRON_URL : "https://atom.io/download/electron"
}

var getAtomPackagesUrl = module.exports.getAtomPackagesUrl = function getAtomPackagesUrl() {
  return process.env.ATOM_PACKAGES_URL != null ? process.env.ATOM_PACKAGES_URL : `${getAtomApiUrl()}/packages`
}

var getAtomApiUrl = module.exports.getAtomApiUrl = function getAtomApiUrl() {
  return process.env.ATOM_API_URL != null ? process.env.ATOM_API_URL : "https://atom.io/api"
}

var getElectronArch = module.exports.getElectronArch = function getElectronArch() {
  switch (process.platform) {
    case "darwin":
      return "x64"
    default:
      return process.env.ATOM_ARCH != null ? process.env.ATOM_ARCH : process.arch
  }
}

var getUserConfigPath = module.exports.getUserConfigPath = function getUserConfigPath() {
  return path.resolve(getAtomDirectory(), ".apmrc")
}

var getGlobalConfigPath = module.exports.getGlobalConfigPath = function getGlobalConfigPath() {
  return path.resolve(getAtomDirectory(), ".apm", ".apmrc")
}

var isWin32 = module.exports.isWin32 = function isWin32() {
  return process.platform === "win32"
}

var x86ProgramFilesDirectory = module.exports.x86ProgramFilesDirectory = function x86ProgramFilesDirectory() {
  return process.env["ProgramFiles(x86)"] || process.env.ProgramFiles
}

var getInstalledVisualStudioFlag = module.exports.getInstalledVisualStudioFlag = function getInstalledVisualStudioFlag() {
  if (!isWin32()) {
    return null
  }

  // Use the explictly-configured version when set
  if (process.env.GYP_MSVS_VERSION) {
    return process.env.GYP_MSVS_VERSION
  }

  if (visualStudioIsInstalled("2019")) {
    return "2019"
  }
  if (visualStudioIsInstalled("2017")) {
    return "2017"
  }
  if (visualStudioIsInstalled("14.0")) {
    return "2015"
  }
}

var visualStudioIsInstalled = module.exports.visualStudioIsInstalled = function visualStudioIsInstalled(version) {
  if (version < 2017) {
    return fs.existsSync(path.join(x86ProgramFilesDirectory(), `Microsoft Visual Studio ${version}`, "Common7", "IDE"))
  } else {
    return (
      fs.existsSync(
        path.join(x86ProgramFilesDirectory(), "Microsoft Visual Studio", `${version}`, "BuildTools", "Common7", "IDE")
      ) ||
      fs.existsSync(
        path.join(x86ProgramFilesDirectory(), "Microsoft Visual Studio", `${version}`, "Community", "Common7", "IDE")
      ) ||
      fs.existsSync(
        path.join(x86ProgramFilesDirectory(), "Microsoft Visual Studio", `${version}`, "Enterprise", "Common7", "IDE")
      ) ||
      fs.existsSync(
        path.join(x86ProgramFilesDirectory(), "Microsoft Visual Studio", `${version}`, "Professional", "Common7", "IDE")
      ) ||
      fs.existsSync(
        path.join(x86ProgramFilesDirectory(), "Microsoft Visual Studio", `${version}`, "WDExpress", "Common7", "IDE")
      )
    )
  }
}

var loadNpm = module.exports.loadNpm = function loadNpm(callback) {
  const npmOptions = {
    userconfig: getUserConfigPath(),
    globalconfig: getGlobalConfigPath(),
  }
  return npm.load(npmOptions, () => callback(null, npm))
}

var getSetting = module.exports.getSetting = function getSetting(key, callback) {
  return loadNpm(() => callback(npm.config.get(key)))
}

var setupApmRcFile = module.exports.setupApmRcFile = function setupApmRcFile() {
  try {
    return fs.writeFileSync(
      getGlobalConfigPath(),
      `\
; This file is auto-generated and should not be edited since any
; modifications will be lost the next time any apm command is run.
;
; You should instead edit your .apmrc config located in ~/.atom/.apmrc
cache = ${getCacheDirectory()}
; Hide progress-bar to prevent npm from altering apm console output.
progress = false\
`
    )
  } catch (error) {
    // ignore error
  }
}
