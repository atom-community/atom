const path = require("path")
const yargs = require("yargs")
const temp = require("temp")
const Command = require("./command")
const fs = require("fysh")

module.exports = class Test extends Command {
    parseOptions(argv) {
        const options = yargs(argv).wrap(Math.min(100, yargs.terminalWidth()))
        options.usage(`\
Usage:
  apm test

Runs the package's tests contained within the spec directory (relative
to the current working directory).\
`)
        options.alias("h", "help").describe("help", "Print this usage message")
        return options.alias("p", "path").string("path").describe("path", "Path to atom command")
    }

    run(options, callback) {
        let atomCommand
        options = this.parseOptions(options.commandArgs)
        const { env } = process

        if (options.argv.path) {
            atomCommand = options.argv.path
        }

        if (!fs.existsSync(atomCommand)) {
            atomCommand = "atom"

            if (process.platform === "win32") {
                atomCommand += ".cmd"
            }
        }

        const packagePath = process.cwd()
        const testArgs = ["--dev", "--test", path.join(packagePath, "spec")]

        if (process.platform === "win32") {
            const logFile = temp.openSync({
                suffix: ".log",
                prefix: `${path.basename(packagePath)}-`,
            })
            fs.closeSync(logFile.fd)
            const logFilePath = logFile.path
            testArgs.push(`--log-file=${logFilePath}`)
            return this.spawn(atomCommand, testArgs, function (code) {
                try {
                    const loggedOutput = fs.readFileSync(logFilePath, "utf8")

                    if (loggedOutput) {
                        process.stdout.write(`${loggedOutput}\n`)
                    }
                } catch (error) {
                    // ignore error
                }

                if (code === 0) {
                    process.stdout.write("Tests passed\n".green)
                    return callback()
                } else if (code !== null && code !== void 0 && code.message) {
                    return callback(`Error spawning Atom: ${code.message}`)
                } else {
                    return callback("Tests failed")
                }
            })
        } else {
            return this.spawn(
                atomCommand,
                testArgs,
                {
                    env,
                    streaming: true,
                },
                function (code) {
                    if (code === 0) {
                        process.stdout.write("Tests passed\n".green)
                        return callback()
                    } else if (code !== null && code !== void 0 && code.message) {
                        return callback(`Error spawning ${atomCommand}: ${code.message}`)
                    } else {
                        return callback("Tests failed")
                    }
                }
            )
        }
    }
}
