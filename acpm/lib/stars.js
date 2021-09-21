const _ = require("@aminya/underscore-plus")
const yargs = require("yargs")
const Command = require("./command")
const config = require("./apm")
const Install = require("./install")
const Login = require("./login")
const request = require("./request")
const tree = require("./tree").tree;

module.exports  = class Stars extends Command {
  parseOptions(argv) {
    const options = yargs(argv).wrap(Math.min(100, yargs.terminalWidth()))
    options.usage(`\

Usage: apm stars
       apm stars --install
       apm stars --user thedaniel
       apm stars --themes

List or install starred Atom packages and themes.\
`)
    options.alias("h", "help").describe("help", "Print this usage message")
    options.alias("i", "install").boolean("install").describe("install", "Install the starred packages")
    options.alias("t", "themes").boolean("themes").describe("themes", "Only list themes")
    options.alias("u", "user").string("user").describe("user", "GitHub username to show starred packages for")
    return options.boolean("json").describe("json", "Output packages as a JSON array")
  }

  getStarredPackages(user, atomVersion, callback) {
    const requestSettings = { json: true }
    if (atomVersion) {
      requestSettings.qs = { engine: atomVersion }
    }

    if (user) {
      requestSettings.url = `${config.getAtomApiUrl()}/users/${user}/stars`
      return this.requestStarredPackages(requestSettings, callback)
    } else {
      requestSettings.url = `${config.getAtomApiUrl()}/stars`
      return Login.getTokenOrLogin((error, token) => {
        if (error != null) {
          return callback(error)
        }

        requestSettings.headers = { authorization: token }
        return this.requestStarredPackages(requestSettings, callback)
      })
    }
  }

  requestStarredPackages(requestSettings, callback) {
    return request.get(requestSettings, function (error, response, body = []) {
      if (error != null) {
        return callback(error)
      } else if (response.statusCode === 200) {
        let packages = body.filter((pack) => (pack&&pack.releases&&pack.releases.latest) != null)
        packages = packages.map(({ readme, metadata, downloads, stargazers_count }) => ({
          ...metadata,
          readme,
          downloads,
          stargazers_count,
        }))
        packages = _.sortBy(packages, "name")
        return callback(null, packages)
      } else {
        const message = request.getErrorMessage(response, body)
        return callback(`Requesting packages failed: ${message}`)
      }
    })
  }

  installPackages(packages, callback) {
    if (packages.length === 0) {
      return callback()
    }

    const commandArgs = packages.map(({ name }) => name)
    return new Install().run({ commandArgs }, callback)
  }

  logPackagesAsJson(packages, callback) {
    console.log(JSON.stringify(packages))
    return callback()
  }

  logPackagesAsText(user, packagesAreThemes, packages, callback) {
    let label
    const userLabel = user != null ? user : "you"
    if (packagesAreThemes) {
      label = `Themes starred by ${userLabel}`
    } else {
      label = `Packages starred by ${userLabel}`
    }
    console.log(`${label.cyan} (${packages.length})`)

    tree(packages, function ({ name, description, downloads, stargazers_count }) {
      label = name.yellow
      if (process.platform === "darwin") {
        label = `\u2B50  ${label}`
      }
      if (description) {
        label += ` ${description.replace(/\s+/g, " ")}`
      }
      if (downloads >= 0 && stargazers_count >= 0) {
        label += ` (${_.pluralize(downloads, "download")}, ${_.pluralize(stargazers_count, "star")})`.grey
      }
      return label
    })

    console.log()
    console.log(
      `Use \`apm stars --install\` to install them all or visit ${
        "http://atom.io/packages".underline
      } to read more about them.`
    )
    console.log()
    return callback()
  }

  run(options, callback) {
    options = this.parseOptions(options.commandArgs)
    const user = options.argv.user && options.argv.user.toString().trim()

    return this.getStarredPackages(user, options.argv.compatible, (error, packages) => {
      if (error != null) {
        return callback(error)
      }

      if (options.argv.themes) {
        packages = packages.filter(({ theme }) => theme)
      }

      if (options.argv.install) {
        return this.installPackages(packages, callback)
      } else if (options.argv.json) {
        return this.logPackagesAsJson(packages, callback)
      } else {
        return this.logPackagesAsText(user, options.argv.themes, packages, callback)
      }
    })
  }
}
