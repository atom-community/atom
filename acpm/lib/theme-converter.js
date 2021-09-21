const path = require("path")
const url = require("url")
const fs = require("fysh")
const request = require("./request")
const TextMateTheme = require("./text-mate-theme")

// Convert a TextMate theme to an Atom theme
module.exports  = class ThemeConverter {
  constructor(sourcePath, destinationPath) {
    this.sourcePath = sourcePath
    this.destinationPath = path.resolve(destinationPath)
  }

  readTheme(callback) {
    const { protocol } = url.parse(this.sourcePath)
    if (protocol === "http:" || protocol === "https:") {
      const requestOptions = { url: this.sourcePath }
      return request.get(requestOptions, (error, response, body) => {
        if (error != null) {
          if (error.code === "ENOTFOUND") {
            error = `Could not resolve URL: ${this.sourcePath}`
          }
          return callback(error)
        } else if (response.statusCode !== 200) {
          return callback(`Request to ${this.sourcePath} failed (${response.headers.status})`)
        } else {
          return callback(null, body)
        }
      })
    } else {
      const sourcePath = path.resolve(this.sourcePath)
      if (fs.isFileSync(sourcePath)) {
        return callback(null, fs.readFileSync(sourcePath, "utf8"))
      } else {
        return callback(`TextMate theme file not found: ${sourcePath}`)
      }
    }
  }

  convert(callback) {
    return this.readTheme((error, themeContents) => {
      let theme
      if (error != null) {
        return callback(error)
      }

      try {
        theme = new TextMateTheme(themeContents)
      } catch (error1) {
        error = error1
        return callback(error)
      }

      fs.writeFileSync(path.join(this.destinationPath, "styles", "base.less"), theme.getStylesheet())
      fs.writeFileSync(path.join(this.destinationPath, "styles", "syntax-variables.less"), theme.getSyntaxVariables())
      return callback()
    })
  }
}
