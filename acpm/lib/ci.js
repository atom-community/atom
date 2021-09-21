const path = require("path")
const fs = require("fysh")
const yargs = require("yargs")
const asyncLib = require("async")
const config = require("./apm")
const Command = require("./command")

module.exports  = class Ci extends Command {
  constructor() {
    super()
    this.atomDirectory = config.getAtomDirectory()
    this.atomNodeDirectory = path.join(this.atomDirectory, ".node-gyp")
    this.atomNpmPath = require.resolve("npm/bin/npm-cli")
  }

  parseOptions(argv) {
    const options = yargs(argv).wrap(Math.min(100, yargs.terminalWidth()))
    options.usage(`\
Usage: apm ci

Install a package with a clean slate.

If you have an up-to-date package-lock.json file created by apm install,
apm ci will install its locked contents exactly. It is substantially
faster than apm install and produces consistently reproduceable builds,
but cannot be used to install new packages or dependencies.\
`)

    options.alias("h", "help").describe("help", "Print this usage message")
    return options.boolean("verbose").default("verbose", false).describe("verbose", "Show verbose debug information")
  }

  installModules(options, callback) {
    process.stdout.write("Installing locked modules")
    if (options.argv.verbose) {
      process.stdout.write("\n")
    } else {
      process.stdout.write(" ")
    }

    const installArgs = [
      "ci",
      "--globalconfig",
      config.getGlobalConfigPath(),
      "--userconfig",
      config.getUserConfigPath(),
      ...Array.from(this.getNpmBuildFlags()),
    ]
    if (options.argv.verbose) {
      installArgs.push("--verbose")
    }

    fs.makeTreeSync(this.atomDirectory)

    const env = { ...process.env, HOME: this.atomNodeDirectory, RUSTUP_HOME: config.getRustupHomeDirPath() }
    this.addBuildEnvVars(env)

    const installOptions = { env, streaming: options.argv.verbose }

    return this.fork(this.atomNpmPath, installArgs, installOptions, (...args) => {
      return this.logCommandResults(callback, ...Array.from(args))
    })
  }

  run(options, callback) {
    const opts = this.parseOptions(options.commandArgs)

    const commands = []
    commands.push((callback) => {
      return config.loadNpm((error, npm) => {
        this.npm = npm
        return callback(error)
      })
    })
    commands.push((cb) => this.loadInstalledAtomMetadata(cb))
    commands.push((cb) => this.installModules(opts, cb))

    const iteratee = (item, next) => item(next)
    return asyncLib.mapSeries(commands, iteratee, function (err) {
      if (err) {
        return callback(err)
      }
      return callback(null)
    })
  }
}
