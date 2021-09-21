const _ = require("@aminya/underscore-plus")
const yargs = require("yargs")
const Command = require("./command")
const config = require("./apm")
const request = require("./request")
const tree = require("./tree").tree

module.exports = class Featured extends Command {
    parseOptions(argv) {
        const options = yargs(argv).wrap(Math.min(100, yargs.terminalWidth()))
        options.usage(`\

Usage: apm featured
       apm featured --themes
       apm featured --compatible 0.49.0

List the Atom packages and themes that are currently featured in the
atom.io registry.\
`)
        options.alias("h", "help").describe("help", "Print this usage message")
        options.alias("t", "themes").boolean("themes").describe("themes", "Only list themes")
        options.alias("c", "compatible").string("compatible").describe("compatible", "Only list packages/themes compatible with this Atom version")
        return options.boolean("json").describe("json", "Output featured packages as JSON array")
    }

    getFeaturedPackagesByType(atomVersion, packageType, callback) {
        if (typeof atomVersion === "function") {
            ;[callback, atomVersion] = Array.from([atomVersion, null])
        }

        const requestSettings = {
            url: `${config.getAtomApiUrl()}/${packageType}/featured`,
            json: true,
        }

        if (atomVersion) {
            requestSettings.qs = {
                engine: atomVersion,
            }
        }

        return request.get(requestSettings, function (error, response, body = []) {
            if (error != null) {
                return callback(error)
            } else if (response.statusCode === 200) {
                let packages = body.filter((pack) => {
                    var _pack$releases

                    return (pack === null || pack === void 0 ? void 0 : (_pack$releases = pack.releases) === null || _pack$releases === void 0 ? void 0 : _pack$releases.latest) != null
                })
                packages = packages.map(({ readme, metadata, downloads, stargazers_count }) => ({ ...metadata, readme, downloads, stargazers_count }))
                packages = _.sortBy(packages, "name")
                return callback(null, packages)
            } else {
                const message = request.getErrorMessage(response, body)
                return callback(`Requesting packages failed: ${message}`)
            }
        })
    }

    getAllFeaturedPackages(atomVersion, callback) {
        return this.getFeaturedPackagesByType(atomVersion, "packages", (error, packages) => {
            if (error != null) {
                return callback(error)
            }

            return this.getFeaturedPackagesByType(atomVersion, "themes", function (error, themes) {
                if (error != null) {
                    return callback(error)
                }

                return callback(null, packages.concat(themes))
            })
        })
    }

    run(options, callback) {
        options = this.parseOptions(options.commandArgs)

        const listCallback = function (error, packages) {
            if (error != null) {
                return callback(error)
            }

            if (options.argv.json) {
                console.log(JSON.stringify(packages))
            } else {
                if (options.argv.themes) {
                    console.log(`${"Featured Atom Themes".cyan} (${packages.length})`)
                } else {
                    console.log(`${"Featured Atom Packages".cyan} (${packages.length})`)
                }

                tree(packages, function ({ name, description, downloads, stargazers_count }) {
                    let label = name.yellow

                    if (description) {
                        label += ` ${description.replace(/\s+/g, " ")}`
                    }

                    if (downloads >= 0 && stargazers_count >= 0) {
                        label += ` (${_.pluralize(downloads, "download")}, ${_.pluralize(stargazers_count, "star")})`.grey
                    }

                    return label
                })
                console.log()
                console.log(`Use \`apm install\` to install them or visit ${"http://atom.io/packages".underline} to read more about them.`)
                console.log()
            }

            return callback()
        }

        if (options.argv.themes) {
            return this.getFeaturedPackagesByType(options.argv.compatible, "themes", listCallback)
        } else {
            return this.getAllFeaturedPackages(options.argv.compatible, listCallback)
        }
    }
}