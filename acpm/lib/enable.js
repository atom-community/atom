const _ = require("@aminya/underscore-plus")
const path = require("path")
const CSON = require("season")
const yargs = require("yargs")
const config = require("./apm")
const Command = require("./command")

module.exports  = class Enable extends Command {
  parseOptions(argv) {
    const options = yargs(argv).wrap(Math.min(100, yargs.terminalWidth()))
    options.usage(`\

Usage: apm enable [<package_name>]...

Enables the named package(s).\
`)
    return options.alias("h", "help").describe("help", "Print this usage message")
  }

  run(options, callback) {
    let error, left, settings
    options = this.parseOptions(options.commandArgs)
    let packageNames = this.packageNamesFromArgv(options.argv)

    const configFilePath = CSON.resolve(path.join(config.getAtomDirectory(), "config"))
    if (!configFilePath) {
      callback("Could not find config.cson. Run Atom first?")
      return
    }

    try {
      settings = CSON.readFileSync(configFilePath)
    } catch (error1) {
      error = error1
      callback(`Failed to load \`${configFilePath}\`: ${error.message}`)
      return
    }

    const keyPath = "*.core.disabledPackages"
    const disabledPackages = (left = _.valueForKeyPath(settings, keyPath)) != null ? left : []

    const errorPackages = _.difference(packageNames, disabledPackages)
    if (errorPackages.length > 0) {
      console.log(`Not Disabled:\n  ${errorPackages.join("\n  ")}`)
    }

    // can't enable a package that isn't disabled
    packageNames = _.difference(packageNames, errorPackages)

    if (packageNames.length === 0) {
      callback("Please specify a package to enable")
      return
    }

    const result = _.difference(disabledPackages, packageNames)
    _.setValueForKeyPath(settings, keyPath, result)

    try {
      CSON.writeFileSync(configFilePath, settings)
    } catch (error2) {
      error = error2
      callback(`Failed to save \`${configFilePath}\`: ${error.message}`)
      return
    }

    console.log(`Enabled:\n  ${packageNames.join("\n  ")}`)
    this.logSuccess()
    return callback()
  }
}
