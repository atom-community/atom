const path = require("path")
const asyncLib = require("async")
const yargs = require("yargs")
const Command = require("./command")
const config = require("./apm")
const fs = require("fysh")

module.exports  = class RebuildModuleCache extends Command {
  constructor() {
    super()
    this.atomPackagesDirectory = path.join(config.getAtomDirectory(), "packages")
  }

  parseOptions(argv) {
    const options = yargs(argv).wrap(Math.min(100, yargs.terminalWidth()))
    options.usage(`\

Usage: apm rebuild-module-cache

Rebuild the module cache for all the packages installed to
~/.atom/packages

You can see the state of the module cache for a package by looking
at the _atomModuleCache property in the package's package.json file.

This command skips all linked packages.\
`)
    return options.alias("h", "help").describe("help", "Print this usage message")
  }

  getResourcePath(callback) {
    if (this.resourcePath) {
      return process.nextTick(() => callback(this.resourcePath))
    } else {
      return config.getResourcePath((resourcePath) => {
        this.resourcePath = resourcePath
        return callback(this.resourcePath)
      })
    }
  }

  rebuild(packageDirectory, callback) {
    return this.getResourcePath((resourcePath) => {
      try {
        if (this.moduleCache == null) {
          this.moduleCache = require(path.join(resourcePath, "src", "module-cache"))
        }
        this.moduleCache.create(packageDirectory)
      } catch (error) {
        return callback(error)
      }

      return callback()
    })
  }

  run(options, callback) {
    const commands = []
    fs.sync.list(this.atomPackagesDirectory).forEach((packageName) => {
      const packageDirectory = path.join(this.atomPackagesDirectory, packageName)
      if (fs.isSymbolicLinkSync(packageDirectory)) {
        return
      }
      if (!fs.isFileSync(path.join(packageDirectory, "package.json"))) {
        return
      }

      return commands.push((callback) => {
        process.stdout.write(`Rebuilding ${packageName} module cache `)
        return this.rebuild(packageDirectory, (error) => {
          if (error != null) {
            this.logFailure()
          } else {
            this.logSuccess()
          }
          return callback(error)
        })
      })
    })

    return asyncLib.waterfall(commands, callback)
  }
}
