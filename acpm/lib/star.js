const path = require("path")
const _ = require("@aminya/underscore-plus")
const async = require("async")
const CSON = require("season")
const yargs = require("yargs")
const config = require("./apm")
const Command = require("./command")
const fs = require("fysh")
const Login = require("./login")
const Packages = require("./packages")
const request = require("./request")

module.exports = class Star extends Command {
  parseOptions(argv) {
    const options = yargs(argv).wrap(Math.min(100, yargs.terminalWidth()))
    options.usage(`\

Usage: apm star <package_name>...

Star the given packages on https://atom.io

Run \`apm stars\` to see all your starred packages.\
`)
    options.alias("h", "help").describe("help", "Print this usage message")
    return options.boolean("installed").describe("installed", "Star all packages in ~/.atom/packages")
  }

  starPackage(packageName, { ignoreUnpublishedPackages, token } = {}, callback) {
    if (process.platform === "darwin") {
      process.stdout.write("\u2B50  ")
    }
    process.stdout.write(`Starring ${packageName} `)
    const requestSettings = {
      json: true,
      url: `${config.getAtomPackagesUrl()}/${packageName}/star`,
      headers: {
        authorization: token,
      },
    }
    return request.post(requestSettings, (error, response, body = {}) => {
      if (error != null) {
        this.logFailure()
        return callback(error)
      } else if (response.statusCode === 404 && ignoreUnpublishedPackages) {
        process.stdout.write("skipped (not published)\n".yellow)
        return callback()
      } else if (response.statusCode !== 200) {
        this.logFailure()
        const message = request.getErrorMessage(response, body)
        return callback(`Starring package failed: ${message}`)
      } else {
        this.logSuccess()
        return callback()
      }
    })
  }

  getInstalledPackageNames() {
    const installedPackages = []
    const userPackagesDirectory = path.join(config.getAtomDirectory(), "packages")
    for (const child of fs.sync.list(userPackagesDirectory)) {
      let manifestPath
      if (!fs.isDirectorySync(path.join(userPackagesDirectory, child))) {
        continue
      }

      if ((manifestPath = CSON.resolve(path.join(userPackagesDirectory, child, "package")))) {
        try {
          let left
          const metadata = (left = CSON.readFileSync(manifestPath)) != null ? left : {}
          if (metadata.name && Packages.getRepository(metadata)) {
            installedPackages.push(metadata.name)
          }
        } catch (error) {
          // ignore error
        }
      }
    }

    return _.uniq(installedPackages)
  }

  run(options, callback) {
    let packageNames
    options = this.parseOptions(options.commandArgs)

    if (options.argv.installed) {
      packageNames = this.getInstalledPackageNames()
      if (packageNames.length === 0) {
        callback()
        return
      }
    } else {
      packageNames = this.packageNamesFromArgv(options.argv)
      if (packageNames.length === 0) {
        callback("Please specify a package name to star")
        return
      }
    }

    return Login.getTokenOrLogin((error, token) => {
      if (error != null) {
        return callback(error)
      }

      const starOptions = {
        ignoreUnpublishedPackages: options.argv.installed,
        token,
      }

      const commands = packageNames.map((packageName) => {
        return (callback) => this.starPackage(packageName, starOptions, callback)
      })
      return async.waterfall(commands, callback)
    })
  }
}
