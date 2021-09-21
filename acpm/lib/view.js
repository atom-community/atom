const _ = require("@aminya/underscore-plus")
const yargs = require("yargs")
const semver = require("semver")
const Command = require("./command")
const config = require("./apm")
const request = require("./request")
const tree = require("./tree").tree

module.exports = class View extends Command {
    parseOptions(argv) {
        const options = yargs(argv).wrap(Math.min(100, yargs.terminalWidth()))
        options.usage(`\

Usage: apm view <package_name>

View information about a package/theme in the atom.io registry.\
`)
        options.alias("h", "help").describe("help", "Print this usage message")
        options.boolean("json").describe("json", "Output featured packages as JSON array")
        return options.string("compatible").describe("compatible", "Show the latest version compatible with this Atom version")
    }

    loadInstalledAtomVersion(options, callback) {
        return process.nextTick(() => {
            let installedAtomVersion

            if (options.argv.compatible) {
                const version = this.normalizeVersion(options.argv.compatible)

                if (semver.valid(version)) {
                    installedAtomVersion = version
                }
            }

            return callback(installedAtomVersion)
        })
    }

    getLatestCompatibleVersion(pack, options, callback) {
        return this.loadInstalledAtomVersion(options, function (installedAtomVersion) {
            if (!installedAtomVersion) {
                return callback(pack.releases.latest)
            }

            let latestVersion = null
            const object = pack.versions != null ? pack.versions : {}

            for (const version in object) {
                var _metadata$engines, _metadata$engines2

                const metadata = object[version]

                if (!semver.valid(version)) {
                    continue
                }

                if (!metadata) {
                    continue
                }

                const engine = ((_metadata$engines = metadata.engines) === null || _metadata$engines === void 0 ? void 0 : _metadata$engines.atom) != null ? ((_metadata$engines2 = metadata.engines) === null || _metadata$engines2 === void 0 ? void 0 : _metadata$engines2.atom) : "*"

                if (!semver.validRange(engine)) {
                    continue
                }

                if (!semver.satisfies(installedAtomVersion, engine)) {
                    continue
                }

                if (latestVersion == null) {
                    latestVersion = version
                }

                if (semver.gt(version, latestVersion)) {
                    latestVersion = version
                }
            }

            return callback(latestVersion)
        })
    }

    getRepository(pack) {
        var _pack$repository, _pack$repository2

        let repository

        if ((repository = ((_pack$repository = pack.repository) === null || _pack$repository === void 0 ? void 0 : _pack$repository.url) != null ? ((_pack$repository2 = pack.repository) === null || _pack$repository2 === void 0 ? void 0 : _pack$repository2.url) : pack.repository)) {
            return repository.replace(/\.git$/, "")
        }
    }

    getPackage(packageName, options, callback) {
        const requestSettings = {
            url: `${config.getAtomPackagesUrl()}/${packageName}`,
            json: true,
        }
        return request.get(requestSettings, (error, response, body = {}) => {
            if (error != null) {
                return callback(error)
            } else if (response.statusCode === 200) {
                return this.getLatestCompatibleVersion(body, options, function (version) {
                    var _body$versions, _body$versions2

                    const { name, readme, downloads, stargazers_count } = body
                    const metadata =
                        ((_body$versions = body.versions) === null || _body$versions === void 0 ? void 0 : _body$versions[version]) != null
                            ? (_body$versions2 = body.versions) === null || _body$versions2 === void 0
                                ? void 0
                                : _body$versions2[version]
                            : {
                                  name,
                              }
                    const pack = { ...metadata, readme, downloads, stargazers_count }
                    return callback(null, pack)
                })
            } else {
                let left
                const message = (left = body.message != null ? body.message : body.error) != null ? left : body
                return callback(`Requesting package failed: ${message}`)
            }
        })
    }

    run(options, callback) {
        options = this.parseOptions(options.commandArgs)
        const [packageName] = Array.from(options.argv._)

        if (!packageName) {
            callback("Missing required package name")
            return
        }

        return this.getPackage(packageName, options, (error, pack) => {
            if (error != null) {
                callback(error)
                return
            }

            if (options.argv.json) {
                console.log(JSON.stringify(pack, null, 2))
            } else {
                let repository
                console.log(`${pack.name.cyan}`)
                const items = []

                if (pack.version) {
                    items.push(pack.version.yellow)
                }

                if ((repository = this.getRepository(pack))) {
                    items.push(repository.underline)
                }

                if (pack.description) {
                    items.push(pack.description.replace(/\s+/g, " "))
                }

                if (pack.downloads >= 0) {
                    items.push(_.pluralize(pack.downloads, "download"))
                }

                if (pack.stargazers_count >= 0) {
                    items.push(_.pluralize(pack.stargazers_count, "star"))
                }

                tree(items)
                console.log()
                console.log(`Run \`apm install ${pack.name}\` to install this package.`)
                console.log()
            }

            return callback()
        })
    }
}
