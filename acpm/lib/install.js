const assert = require("assert")
const path = require("path")
const _ = require("@aminya/underscore-plus")
const asyncLib = require("async")
const CSON = require("season")
const yargs = require("yargs")
const Git = require("git-utils")
const semver = require("semver")
const temp = require("temp")
const hostedGitInfo = require("hosted-git-info")
const config = require("./apm")
const Command = require("./command")
const fs = require("fysh")
const RebuildModuleCache = require("./rebuild-module-cache")
const request = require("./request")
const isDeprecatedPackage = require("./deprecated-packages").isDeprecatedPackage
const rm = require("rimraf")
const ncp = require("ncp")

// TODO: this needs to be removed because ncp is deprecated and unmaintained
//       however, replacing this with fs.copySync causes problems with system links not being copied
//       or at least thats what the failing test says
//       for all I know it could be correct behavior
function cp(sourcePath, destinationPath, callback) {
    return rm(destinationPath, function (error) {
        if (error != null) {
            return callback(error)
        } else {
            return ncp(sourcePath, destinationPath, callback)
        }
    })
}

module.exports = class Install extends Command {
    constructor() {
        super()

        this.installModules = (options, callback) => {
            if (!options.argv.json) {
                process.stdout.write("Installing modules ")
            }

            return this.forkInstallCommand(options, (...args) => {
                if (options.argv.json) {
                    return this.logCommandResultsIfFail(callback, ...Array.from(args))
                } else {
                    return this.logCommandResults(callback, ...Array.from(args))
                }
            })
        }

        this.installGitPackageDependencies = (directory, options, callback) => {
            options.cwd = directory
            return this.installDependencies(options, callback)
        }

        this.atomDirectory = config.getAtomDirectory()
        this.atomPackagesDirectory = path.join(this.atomDirectory, "packages")
        this.atomNodeDirectory = path.join(this.atomDirectory, ".node-gyp")
        this.atomNpmPath = require.resolve("npm/bin/npm-cli")
        this.repoLocalPackagePathRegex = /^file:(?!\/\/)(.*)/
    }

    parseOptions(argv) {
        const options = yargs(argv).wrap(Math.min(100, yargs.terminalWidth()))
        options.usage(`\

Usage: apm install [<package_name>...]
       apm install <package_name>@<package_version>
       apm install <git_remote>
       apm install <github_username>/<github_project>
       apm install --packages-file my-packages.txt
       apm i (with any of the previous argument usage)

Install the given Atom package to ~/.atom/packages/<package_name>.

If no package name is given then all the dependencies in the package.json
file are installed to the node_modules folder in the current working
directory.

A packages file can be specified that is a newline separated list of
package names to install with optional versions using the
\`package-name@version\` syntax.\
`)
        options.alias("c", "compatible").string("compatible").describe("compatible", "Only install packages/themes compatible with this Atom version")
        options.alias("h", "help").describe("help", "Print this usage message")
        options.alias("s", "silent").boolean("silent").describe("silent", "Set the npm log level to silent")
        options.alias("q", "quiet").boolean("quiet").describe("quiet", "Set the npm log level to warn")
        options.boolean("check").describe("check", "Check that native build tools are installed")
        options.boolean("verbose").default("verbose", false).describe("verbose", "Show verbose debug information")
        options.string("packages-file").describe("packages-file", "A text file containing the packages to install")
        return options.boolean("production").describe("production", "Do not install dev dependencies")
    }

    installModule(options, pack, moduleURI, callback) {
        let installDirectory, nodeModulesDirectory
        const installGlobally = options.installGlobally != null ? options.installGlobally : true
        const installArgs = ["--globalconfig", config.getGlobalConfigPath(), "--userconfig", config.getUserConfigPath(), "install"]
        installArgs.push(moduleURI)
        installArgs.push(...Array.from(this.getNpmBuildFlags() || []))

        if (installGlobally) {
            installArgs.push("--global-style")
        }

        if (options.argv.silent) {
            installArgs.push("--silent")
        }

        if (options.argv.quiet) {
            installArgs.push("--quiet")
        }

        if (options.argv.production) {
            installArgs.push("--production")
        }

        if (options.argv.verbose) {
            installArgs.push("--verbose")
        }

        fs.makeTreeSync(this.atomDirectory)
        const env = { ...process.env, HOME: this.atomNodeDirectory, RUSTUP_HOME: config.getRustupHomeDirPath() }
        this.addBuildEnvVars(env)
        const installOptions = {
            env,
        }

        if (this.verbose) {
            installOptions.streaming = true
        }

        if (installGlobally) {
            installDirectory = temp.mkdirSync("apm-install-dir-")
            nodeModulesDirectory = path.join(installDirectory, "node_modules")
            fs.makeTreeSync(nodeModulesDirectory)
            installOptions.cwd = installDirectory
        }

        return this.fork(this.atomNpmPath, installArgs, installOptions, (code, stderr = "", stdout = "") => {
            if (code === 0) {
                let child, destination

                if (installGlobally) {
                    const commands = []
                    const children = fs.readdirSync(nodeModulesDirectory).filter((dir) => dir !== ".bin")
                    assert.equal(children.length, 1, "Expected there to only be one child in node_modules")
                    child = children[0]
                    const source = path.join(nodeModulesDirectory, child)
                    destination = path.join(this.atomPackagesDirectory, child)
                    commands.push((next) => cp(source, destination, next))
                    commands.push((next) => this.buildModuleCache(pack.name, next))
                    commands.push((next) => this.warmCompileCache(pack.name, next))
                    return asyncLib.waterfall(commands, (error) => {
                        if (error != null) {
                            this.logFailure()
                        } else {
                            if (!options.argv.json) {
                                this.logSuccess()
                            }
                        }

                        return callback(error, {
                            name: child,
                            installPath: destination,
                        })
                    })
                } else {
                    return callback(null, {
                        name: child,
                        installPath: destination,
                    })
                }
            } else {
                if (installGlobally) {
                    fs.removeSync(installDirectory)
                    this.logFailure()
                }

                let error = `${stdout}\n${stderr}`

                if (error.indexOf("code ENOGIT") !== -1) {
                    error = this.getGitErrorMessage(pack)
                }

                return callback(error)
            }
        })
    }

    getGitErrorMessage(pack) {
        let message = `\
Failed to install ${pack.name} because Git was not found.

The ${pack.name} package has module dependencies that cannot be installed without Git.

You need to install Git and add it to your path environment variable in order to install this package.
\
`

        switch (process.platform) {
            case "win32":
                message += `\

You can install Git by downloading, installing, and launching GitHub for Windows: https://windows.github.com
\
`
                break

            case "linux":
                message += `\

You can install Git from your OS package manager.
\
`
                break
        }

        message += `\

Run apm -v after installing Git to see what version has been detected.\
`
        return message
    }

    forkInstallCommand(options, callback) {
        const installArgs = ["--globalconfig", config.getGlobalConfigPath(), "--userconfig", config.getUserConfigPath(), "install"]
        installArgs.push(...Array.from(this.getNpmBuildFlags() || []))

        if (options.argv.silent) {
            installArgs.push("--silent")
        }

        if (options.argv.quiet) {
            installArgs.push("--quiet")
        }

        if (options.argv.production) {
            installArgs.push("--production")
        }

        fs.makeTreeSync(this.atomDirectory)
        const env = { ...process.env, HOME: this.atomNodeDirectory, RUSTUP_HOME: config.getRustupHomeDirPath() }
        this.addBuildEnvVars(env)
        const installOptions = {
            env,
        }

        if (options.cwd) {
            installOptions.cwd = options.cwd
        }

        if (this.verbose) {
            installOptions.streaming = true
        }

        return this.fork(this.atomNpmPath, installArgs, installOptions, callback)
    } // Request package information from the atom.io API for a given package name.
    //
    // packageName - The string name of the package to request.
    // callback - The function to invoke when the request completes with an error
    //            as the first argument and an object as the second.

    requestPackage(packageName, callback) {
        const requestSettings = {
            url: `${config.getAtomPackagesUrl()}/${packageName}`,
            json: true,
            retries: 4,
        }
        return request.get(requestSettings, function (error, response, body = {}) {
            let message

            if (error != null) {
                message = `Request for package information failed: ${error.message}`

                if (error.code) {
                    message += ` (${error.code})`
                }

                return callback(message)
            } else if (response.statusCode !== 200) {
                message = request.getErrorMessage(response, body)
                return callback(`Request for package information failed: ${message}`)
            } else {
                if (body.releases.latest) {
                    return callback(null, body)
                } else {
                    return callback(`No releases available for ${packageName}`)
                }
            }
        })
    } // Is the package at the specified version already installed?
    //
    //  * packageName: The string name of the package.
    //  * packageVersion: The string version of the package.

    isPackageInstalled(packageName, packageVersion) {
        try {
            let left
            const { version } = (left = CSON.readFileSync(CSON.resolve(path.join("node_modules", packageName, "package")))) != null ? left : {}
            return packageVersion === version
        } catch (error) {
            return false
        }
    } // Install the package with the given name and optional version
    //
    // metadata - The package metadata object with at least a name key. A version
    //            key is also supported. The version defaults to the latest if
    //            unspecified.
    // options - The installation options object.
    // callback - The function to invoke when installation completes with an
    //            error as the first argument.

    installRegisteredPackage(metadata, options, callback) {
        const packageName = metadata.name
        let packageVersion = metadata.version
        const installGlobally = options.installGlobally != null ? options.installGlobally : true

        if (!installGlobally) {
            if (packageVersion && this.isPackageInstalled(packageName, packageVersion)) {
                callback(null, {})
                return
            }
        }

        let label = packageName

        if (packageVersion) {
            label += `@${packageVersion}`
        }

        if (!options.argv.json) {
            process.stdout.write(`Installing ${label} `)

            if (installGlobally) {
                process.stdout.write(`to ${this.atomPackagesDirectory} `)
            }
        }

        return this.requestPackage(packageName, (error, pack) => {
            if (error != null) {
                this.logFailure()
                return callback(error)
            } else {
                var _pack$versions$packag, _pack$versions$packag2

                if (packageVersion == null) {
                    packageVersion = this.getLatestCompatibleVersion(pack)
                }

                if (!packageVersion) {
                    this.logFailure()
                    callback(`No available version compatible with the installed Atom version: ${this.installedAtomVersion}`)
                    return
                }

                const { tarball } = ((_pack$versions$packag = pack.versions[packageVersion]) === null || _pack$versions$packag === void 0 ? void 0 : _pack$versions$packag.dist) != null ? ((_pack$versions$packag2 = pack.versions[packageVersion]) === null || _pack$versions$packag2 === void 0 ? void 0 : _pack$versions$packag2.dist) : {}

                if (!tarball) {
                    this.logFailure()
                    callback(`Package version: ${packageVersion} not found`)
                    return
                }

                const commands = []
                commands.push((next) => this.installModule(options, pack, tarball, next))

                if (
                    installGlobally &&
                    packageName.localeCompare(pack.name, "en", {
                        sensitivity: "accent",
                    }) !== 0
                ) {
                    commands.push((newPack, next) => {
                        // package was renamed; delete old package folder
                        fs.removeSync(path.join(this.atomPackagesDirectory, packageName))
                        return next(null, newPack)
                    })
                }

                commands.push(function ({ installPath }, next) {
                    if (installPath != null) {
                        metadata = JSON.parse(fs.readFileSync(path.join(installPath, "package.json"), "utf8"))
                        const json = {
                            installPath,
                            metadata,
                        }
                        return next(null, json)
                    } else {
                        return next(null, {})
                    }
                }) // installed locally, no install path data

                return asyncLib.waterfall(commands, (error, json) => {
                    if (!installGlobally) {
                        if (error != null) {
                            this.logFailure()
                        } else {
                            if (!options.argv.json) {
                                this.logSuccess()
                            }
                        }
                    }

                    return callback(error, json)
                })
            }
        })
    } // Install the package with the given name and local path
    //
    // packageName - The name of the package
    // packagePath - The local path of the package in the form "file:./packages/package-name"
    // options     - The installation options object.
    // callback    - The function to invoke when installation completes with an
    //               error as the first argument.

    installLocalPackage(packageName, packagePath, options, callback) {
        if (!options.argv.json) {
            process.stdout.write(`Installing ${packageName} from ${packagePath.slice("file:".length)} `)
            const commands = []
            commands.push((next) => {
                return this.installModule(
                    options,
                    {
                        name: packageName,
                    },
                    packagePath,
                    next
                )
            })
            commands.push(function ({ installPath }, next) {
                if (installPath != null) {
                    const metadata = JSON.parse(fs.readFileSync(path.join(installPath, "package.json"), "utf8"))
                    const json = {
                        installPath,
                        metadata,
                    }
                    return next(null, json)
                } else {
                    return next(null, {})
                }
            }) // installed locally, no install path data

            return asyncLib.waterfall(commands, (error, json) => {
                if (error != null) {
                    this.logFailure()
                } else {
                    if (!options.argv.json) {
                        this.logSuccess()
                    }
                }

                return callback(error, json)
            })
        }
    } // Install all the package dependencies found in the package.json file.
    //
    // options - The installation options
    // callback - The callback function to invoke when done with an error as the
    //            first argument.

    installPackageDependencies(options, callback) {
        options = { ...options, installGlobally: false }
        const commands = []
        const object = this.getPackageDependencies()

        for (const name in object) {
            const version = object[name]

            ;((name, version) => {
                return commands.push((next) => {
                    if (this.repoLocalPackagePathRegex.test(version)) {
                        return this.installLocalPackage(name, version, options, next)
                    } else {
                        return this.installRegisteredPackage(
                            {
                                name,
                                version,
                            },
                            options,
                            next
                        )
                    }
                })
            })(name, version)
        }

        return asyncLib.series(commands, callback)
    }

    installDependencies(options, callback) {
        options.installGlobally = false
        const commands = []
        commands.push((callback) => this.installModules(options, callback))
        commands.push((callback) => this.installPackageDependencies(options, callback))
        return asyncLib.waterfall(commands, callback)
    } // Get all package dependency names and versions from the package.json file.

    getPackageDependencies() {
        try {
            let left
            const metadata = fs.readFileSync("package.json", "utf8")
            const { packageDependencies, dependencies } = (left = JSON.parse(metadata)) != null ? left : {}

            if (!packageDependencies) {
                return {}
            }

            if (!dependencies) {
                return packageDependencies
            } // This code filters out any `packageDependencies` that have an equivalent
            // normalized repo-local package path entry in the `dependencies` section of
            // `package.json`.  Versioned `packageDependencies` are always returned.

            const filteredPackages = {}

            for (const packageName in packageDependencies) {
                const packageSpec = packageDependencies[packageName]
                const dependencyPath = this.getRepoLocalPackagePath(dependencies[packageName])
                const packageDependencyPath = this.getRepoLocalPackagePath(packageSpec)

                if (!packageDependencyPath || dependencyPath !== packageDependencyPath) {
                    filteredPackages[packageName] = packageSpec
                }
            }

            return filteredPackages
        } catch (error) {
            return {}
        }
    }

    getRepoLocalPackagePath(packageSpec) {
        if (!packageSpec) {
            return undefined
        }

        const repoLocalPackageMatch = packageSpec.match(this.repoLocalPackagePathRegex)

        if (repoLocalPackageMatch) {
            return path.normalize(repoLocalPackageMatch[1])
        } else {
            return undefined
        }
    }

    createAtomDirectories() {
        fs.makeTreeSync(this.atomDirectory)
        fs.makeTreeSync(this.atomPackagesDirectory)
        return fs.makeTreeSync(this.atomNodeDirectory)
    } // Compile a sample native module to see if a useable native build toolchain
    // is instlalled and successfully detected. This will include both Python
    // and a compiler.

    checkNativeBuildTools(callback) {
        process.stdout.write("Checking for native build tools ")
        const buildArgs = ["--globalconfig", config.getGlobalConfigPath(), "--userconfig", config.getUserConfigPath(), "build"]
        buildArgs.push(path.resolve(__dirname, "..", "native-module"))
        buildArgs.push(...Array.from(this.getNpmBuildFlags() || []))
        fs.makeTreeSync(this.atomDirectory)
        const env = { ...process.env, HOME: this.atomNodeDirectory, RUSTUP_HOME: config.getRustupHomeDirPath() }
        this.addBuildEnvVars(env)
        const buildOptions = {
            env,
        }

        if (this.verbose) {
            buildOptions.streaming = true
        }

        fs.removeSync(path.resolve(__dirname, "..", "native-module", "build"))
        return this.fork(this.atomNpmPath, buildArgs, buildOptions, (...args) => {
            return this.logCommandResults(callback, ...Array.from(args))
        })
    }

    packageNamesFromPath(filePath) {
        filePath = path.resolve(filePath)

        if (!fs.isFileSync(filePath)) {
            throw new Error(`File '${filePath}' does not exist`)
        }

        const packages = fs.readFileSync(filePath, "utf8")
        return this.sanitizePackageNames(packages.split(/\s/))
    }

    buildModuleCache(packageName, callback) {
        const packageDirectory = path.join(this.atomPackagesDirectory, packageName)
        const rebuildCacheCommand = new RebuildModuleCache()
        return rebuildCacheCommand.rebuild(packageDirectory, () =>
            // Ignore cache errors and just finish the install
            callback()
        )
    }

    warmCompileCache(packageName, callback) {
        const packageDirectory = path.join(this.atomPackagesDirectory, packageName)
        return this.getResourcePath((resourcePath) => {
            try {
                const CompileCache = require(path.join(resourcePath, "src", "compile-cache"))

                const onDirectory = (directoryPath) => path.basename(directoryPath) !== "node_modules"

                const onFile = (filePath) => {
                    try {
                        return CompileCache.addPathToCache(filePath, this.atomDirectory)
                    } catch (error) {
                        // ignore error
                    }
                }

                fs.traverseTreeSync(packageDirectory, onFile, onDirectory)
            } catch (error) {
                // ignore error
            }

            return callback(null)
        })
    }

    isBundledPackage(packageName, callback) {
        return this.getResourcePath(function (resourcePath) {
            var _atomMetadata, _atomMetadata$package

            let atomMetadata

            try {
                atomMetadata = JSON.parse(fs.readFileSync(path.join(resourcePath, "package.json")))
            } catch (error) {
                return callback(false)
            }

            return callback((_atomMetadata = atomMetadata) === null || _atomMetadata === void 0 ? void 0 : (_atomMetadata$package = _atomMetadata.packageDependencies) === null || _atomMetadata$package === void 0 ? void 0 : _atomMetadata$package.hasOwnProperty(packageName))
        })
    }

    getLatestCompatibleVersion(pack) {
        if (!this.installedAtomVersion) {
            if (isDeprecatedPackage(pack.name, pack.releases.latest)) {
                return null
            } else {
                return pack.releases.latest
            }
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

            if (isDeprecatedPackage(pack.name, version)) {
                continue
            }

            const engine = ((_metadata$engines = metadata.engines) === null || _metadata$engines === void 0 ? void 0 : _metadata$engines.atom) != null ? ((_metadata$engines2 = metadata.engines) === null || _metadata$engines2 === void 0 ? void 0 : _metadata$engines2.atom) : "*"

            if (!semver.validRange(engine)) {
                continue
            }

            if (!semver.satisfies(this.installedAtomVersion, engine)) {
                continue
            }

            if (latestVersion == null) {
                latestVersion = version
            }

            if (semver.gt(version, latestVersion)) {
                latestVersion = version
            }
        }

        return latestVersion
    }

    getHostedGitInfo(name) {
        return hostedGitInfo.fromUrl(name)
    }

    installGitPackage(packageUrl, options, callback) {
        const tasks = []
        const cloneDir = temp.mkdirSync("atom-git-package-clone-")
        tasks.push((data, next) => {
            const urls = this.getNormalizedGitUrls(packageUrl)
            return this.cloneFirstValidGitUrl(urls, cloneDir, options, (err) => next(err, data))
        })
        tasks.push((data, next) => {
            return this.installGitPackageDependencies(cloneDir, options, (err) => next(err, data))
        })
        tasks.push((data, next) => {
            return this.getRepositoryHeadSha(cloneDir, function (err, sha) {
                data.sha = sha
                return next(err, data)
            })
        })
        tasks.push(function (data, next) {
            const metadataFilePath = CSON.resolve(path.join(cloneDir, "package"))
            return CSON.readFile(metadataFilePath, function (err, metadata) {
                data.metadataFilePath = metadataFilePath
                data.metadata = metadata
                return next(err, data)
            })
        })
        tasks.push(function (data, next) {
            data.metadata.apmInstallSource = {
                type: "git",
                source: packageUrl,
                sha: data.sha,
            }
            return CSON.writeFile(data.metadataFilePath, data.metadata, (err) => next(err, data))
        })
        tasks.push((data, next) => {
            const { name } = data.metadata
            const targetDir = path.join(this.atomPackagesDirectory, name)

            if (!options.argv.json) {
                process.stdout.write(`Moving ${name} to ${targetDir} `)
            }

            return cp(cloneDir, targetDir, (err) => {
                if (err) {
                    return next(err)
                } else {
                    if (!options.argv.json) {
                        this.logSuccess()
                    }

                    const json = {
                        installPath: targetDir,
                        metadata: data.metadata,
                    }
                    return next(null, json)
                }
            })
        })

        const iteratee = (currentData, task, next) => task(currentData, next)

        return asyncLib.reduce(tasks, {}, iteratee, callback)
    }

    getNormalizedGitUrls(packageUrl) {
        const packageInfo = this.getHostedGitInfo(packageUrl)

        if (packageUrl.indexOf("file://") === 0) {
            return [packageUrl]
        } else if (packageInfo.default === "sshurl") {
            return [packageInfo.toString()]
        } else if (packageInfo.default === "https") {
            return [packageInfo.https().replace(/^git\+https:/, "https:")]
        } else if (packageInfo.default === "shortcut") {
            return [packageInfo.https().replace(/^git\+https:/, "https:"), packageInfo.sshurl()]
        }
    }

    cloneFirstValidGitUrl(urls, cloneDir, options, callback) {
        return asyncLib.detectSeries(
            urls,
            (url, next) => {
                return this.cloneNormalizedUrl(url, cloneDir, options, (error) => next(null, !error))
            },
            function (err, result) {
                if (err || !result) {
                    const invalidUrls = `Couldn't clone ${urls.join(" or ")}`
                    const invalidUrlsError = new Error(invalidUrls)
                    return callback(invalidUrlsError)
                } else {
                    return callback()
                }
            }
        )
    }

    cloneNormalizedUrl(url, cloneDir, options, callback) {
        // Require here to avoid circular dependency
        const Develop = require("./develop")

        const develop = new Develop()
        return develop.cloneRepository(url, cloneDir, options, (err) => callback(err))
    }

    getRepositoryHeadSha(repoDir, callback) {
        try {
            const repo = Git.open(repoDir)
            const sha = repo.getReferenceTarget("HEAD")
            return callback(null, sha)
        } catch (err) {
            return callback(err)
        }
    }

    run(options, callback) {
        let packageNames
        options = this.parseOptions(options.commandArgs)
        const packagesFilePath = options.argv["packages-file"]
        this.createAtomDirectories()

        if (options.argv.check) {
            config.loadNpm((error, npm) => {
                this.npm = npm
                return this.loadInstalledAtomMetadata(() => {
                    return this.checkNativeBuildTools(callback)
                })
            })
            return
        }

        this.verbose = options.argv.verbose

        if (this.verbose) {
            request.debug(true)
            process.env.NODE_DEBUG = "request"
        }

        const installPackage = (name, nextInstallStep) => {
            const gitPackageInfo = this.getHostedGitInfo(name)

            if (gitPackageInfo || name.indexOf("file://") === 0) {
                return this.installGitPackage(name, options, nextInstallStep)
            } else if (name === ".") {
                return this.installDependencies(options, nextInstallStep)
            } else {
                // is registered package
                let version
                const atIndex = name.indexOf("@")

                if (atIndex > 0) {
                    version = name.substring(atIndex + 1)
                    name = name.substring(0, atIndex)
                }

                return this.isBundledPackage(name, (isBundledPackage) => {
                    if (isBundledPackage) {
                        console.error(
                            `\
The ${name} package is bundled with Atom and should not be explicitly installed.
You can run \`apm uninstall ${name}\` to uninstall it and then the version bundled
with Atom will be used.\
`.yellow
                        )
                    }

                    return this.installRegisteredPackage(
                        {
                            name,
                            version,
                        },
                        options,
                        nextInstallStep
                    )
                })
            }
        }

        if (packagesFilePath) {
            try {
                packageNames = this.packageNamesFromPath(packagesFilePath)
            } catch (error1) {
                const error = error1
                return callback(error)
            }
        } else {
            packageNames = this.packageNamesFromArgv(options.argv)

            if (packageNames.length === 0) {
                packageNames.push(".")
            }
        }

        const commands = []
        commands.push((cb) => {
            return config.loadNpm((error, npm) => {
                this.npm = npm
                return cb(error)
            })
        })
        commands.push((cb) => this.loadInstalledAtomMetadata(() => cb()))
        packageNames.forEach((packageName) => commands.push((cb) => installPackage(packageName, cb)))

        const iteratee = (item, next) => item(next)

        return asyncLib.mapSeries(commands, iteratee, function (err, installedPackagesInfo) {
            if (err) {
                return callback(err)
            }

            installedPackagesInfo = _.compact(installedPackagesInfo)
            installedPackagesInfo = installedPackagesInfo.filter((item, idx) => packageNames[idx] !== ".")

            if (options.argv.json) {
                console.log(JSON.stringify(installedPackagesInfo, null, "  "))
            }

            return callback(null)
        })
    }
}
