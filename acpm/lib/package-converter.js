const path = require("path")
const url = require("url")
const zlib = require("zlib")
const _ = require("@aminya/underscore-plus")
const CSON = require("season")
const plist = require("@atom/plist")
const ScopeSelector = require("first-mate").ScopeSelector;
const tar = require("tar")
const temp = require("temp")
const fs = require("fysh")
const request = require("./request")

// Convert a TextMate bundle to an Atom package
module.exports = class PackageConverter {
  constructor(sourcePath, destinationPath) {
    this.sourcePath = sourcePath
    this.destinationPath = path.resolve(destinationPath)

    this.plistExtensions = [".plist", ".tmCommand", ".tmLanguage", ".tmMacro", ".tmPreferences", ".tmSnippet"]

    this.directoryMappings = {
      Preferences: "settings",
      Snippets: "snippets",
      Syntaxes: "grammars",
    }
  }

  convert(callback) {
    const { protocol } = url.parse(this.sourcePath)
    if (protocol === "http:" || protocol === "https:") {
      return this.downloadBundle(callback)
    } else {
      return this.copyDirectories(this.sourcePath, callback)
    }
  }

  getDownloadUrl() {
    let downloadUrl = this.sourcePath
    downloadUrl = downloadUrl.replace(/(\.git)?\/*$/, "")
    return (downloadUrl += "/archive/master.tar.gz")
  }

  downloadBundle(callback) {
    const tempPath = temp.mkdirSync("atom-bundle-")
    const requestOptions = { url: this.getDownloadUrl() }
    return request.createReadStream(requestOptions, (readStream) => {
      readStream.on("response", function ({ headers, statusCode }) {
        if (statusCode !== 200) {
          return callback(`Download failed (${headers.status})`)
        }
      })

      return readStream
        .pipe(zlib.createGunzip())
        .pipe(tar.extract({ cwd: tempPath }))
        .on("error", (error) => callback(error))
        .on("end", () => {
          const sourcePath = path.join(tempPath, fs.readdirSync(tempPath)[0])
          return this.copyDirectories(sourcePath, callback)
        })
    })
  }

  copyDirectories(sourcePath, callback) {
    let packageName
    sourcePath = path.resolve(sourcePath)
    try {
        let val = JSON.parse(fs.readFileSync(path.join(sourcePath, "package.json")))
      packageName = val == null ? null : val.packageName
    } catch (error) {
      // ignore error
    }
    if (packageName == null) {
      packageName = path.basename(this.destinationPath)
    }

    this.convertSnippets(packageName, sourcePath)
    this.convertPreferences(packageName, sourcePath)
    this.convertGrammars(sourcePath)
    return callback()
  }

  filterObject(object) {
    delete object.uuid
    return delete object.keyEquivalent
  }

  convertSettings(settings) {
    if (settings.shellVariables) {
      const shellVariables = {}
      for (const { name, value } of settings.shellVariables) {
        shellVariables[name] = value
      }
      settings.shellVariables = shellVariables
    }

    const editorProperties = _.compactObject({
      commentStart: _.valueForKeyPath(settings, "shellVariables.TM_COMMENT_START"),
      commentEnd: _.valueForKeyPath(settings, "shellVariables.TM_COMMENT_END"),
      increaseIndentPattern: settings.increaseIndentPattern,
      decreaseIndentPattern: settings.decreaseIndentPattern,
      foldEndPattern: settings.foldingStopMarker,
      completions: settings.completions,
    })
    if (!_.isEmpty(editorProperties)) {
      return { editor: editorProperties }
    }
  }

  readFileSync(filePath) {
    if (this.plistExtensions.includes(path.extname(filePath))) {
      return plist.parseFileSync(filePath)
    } else if ([".json", ".cson"].includes(path.extname(filePath))) {
      return CSON.readFileSync(filePath)
    }
  }

  writeFileSync(filePath, object = {}) {
    this.filterObject(object)
    if (Object.keys(object).length > 0) {
      return CSON.writeFileSync(filePath, object)
    }
  }

  convertFile(sourcePath, destinationDir) {
    let contents
    const extension = path.extname(sourcePath)
    let destinationName = `${path.basename(sourcePath, extension)}.cson`
    destinationName = destinationName.toLowerCase()
    const destinationPath = path.join(destinationDir, destinationName)

    if (this.plistExtensions.includes(path.extname(sourcePath))) {
      contents = plist.parseFileSync(sourcePath)
    } else if ([".json", ".cson"].includes(path.extname(sourcePath))) {
      contents = CSON.readFileSync(sourcePath)
    }

    return this.writeFileSync(destinationPath, contents)
  }

  normalizeFilenames(directoryPath) {
    if (!fs.isDirectorySync(directoryPath)) {
      return
    }

    return (() => {
      const result = []
      for (const child of fs.readdirSync(directoryPath)) {
        const childPath = path.join(directoryPath, child)

        // Invalid characters taken from http://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx
        let convertedFileName = child.replace(/["*/:<>?\\|]+/g, "-")
        if (child === convertedFileName) {
          continue
        }

        convertedFileName = convertedFileName.replace(/[\s-]+/g, "-")
        let convertedPath = path.join(directoryPath, convertedFileName)
        let suffix = 1
        while (fs.existsSync(convertedPath) || fs.existsSync(convertedPath.toLowerCase())) {
          const extension = path.extname(convertedFileName)
          convertedFileName = `${path.basename(convertedFileName, extension)}-${suffix}${extension}`
          convertedPath = path.join(directoryPath, convertedFileName)
          suffix++
        }
        result.push(fs.renameSync(childPath, convertedPath))
      }
      return result
    })()
  }

  convertSnippets(packageName, source) {
    let sourceSnippets = path.join(source, "snippets")
    if (!fs.isDirectorySync(sourceSnippets)) {
      sourceSnippets = path.join(source, "Snippets")
    }
    if (!fs.isDirectorySync(sourceSnippets)) {
      return
    }

    const snippetsBySelector = {}
    const destination = path.join(this.destinationPath, "snippets")
    for (const child of fs.readdirSync(sourceSnippets)) {
      let left, selector
      const snippet = (left = this.readFileSync(path.join(sourceSnippets, child))) != null ? left : {}
      const { scope, tabTrigger } = snippet
      let { name, content } = snippet
      if (!tabTrigger || !content) {
        continue
      }

      // Replace things like '${TM_C_POINTER: *}' with ' *'
      content = content.replace(/\${TM_[A-Z_]+:([^}]+)}/g, "$1")

      // Replace things like '${1:${TM_FILENAME/(\\w+)*/(?1:$1:NSObject)/}}'
      // with '$1'
      content = content.replace(/\${(\d)+:\s*\${TM_[^}]+\s*}\s*}/g, "$$1")

      // Unescape escaped dollar signs $
      content = content.replace(/\\\$/g, "$")

      if (name == null) {
        const extension = path.extname(child)
        name = path.basename(child, extension)
      }

      try {
        if (scope) {
          selector = new ScopeSelector(scope).toCssSelector()
        }
      } catch (e) {
        e.message = `In file ${e.fileName} at ${JSON.stringify(scope)}: ${e.message}`
        throw e
      }
      if (selector == null) {
        selector = "*"
      }

      if (snippetsBySelector[selector] == null) {
        snippetsBySelector[selector] = {}
      }
      snippetsBySelector[selector][name] = { prefix: tabTrigger, body: content }
    }

    this.writeFileSync(path.join(destination, `${packageName}.cson`), snippetsBySelector)
    return this.normalizeFilenames(destination)
  }

  convertPreferences(packageName, source) {
    let sourcePreferences = path.join(source, "preferences")
    if (!fs.isDirectorySync(sourcePreferences)) {
      sourcePreferences = path.join(source, "Preferences")
    }
    if (!fs.isDirectorySync(sourcePreferences)) {
      return
    }

    const preferencesBySelector = {}
    const destination = path.join(this.destinationPath, "settings")
    for (const child of fs.readdirSync(sourcePreferences)) {
      let left, properties
      const { scope, settings } = (left = this.readFileSync(path.join(sourcePreferences, child))) != null ? left : {}
      if (!scope || !settings) {
        continue
      }

      if ((properties = this.convertSettings(settings))) {
        let selector
        try {
          selector = new ScopeSelector(scope).toCssSelector()
        } catch (e) {
          e.message = `In file ${e.fileName} at ${JSON.stringify(scope)}: ${e.message}`
          throw e
        }
        for (const key in properties) {
          const value = properties[key]
          if (preferencesBySelector[selector] == null) {
            preferencesBySelector[selector] = {}
          }
          if (preferencesBySelector[selector][key] != null) {
            preferencesBySelector[selector][key] = { ...value, ...preferencesBySelector[selector][key] }
          } else {
            preferencesBySelector[selector][key] = value
          }
        }
      }
    }

    this.writeFileSync(path.join(destination, `${packageName}.cson`), preferencesBySelector)
    return this.normalizeFilenames(destination)
  }

  convertGrammars(source) {
    let sourceSyntaxes = path.join(source, "syntaxes")
    if (!fs.isDirectorySync(sourceSyntaxes)) {
      sourceSyntaxes = path.join(source, "Syntaxes")
    }
    if (!fs.isDirectorySync(sourceSyntaxes)) {
      return
    }

    const destination = path.join(this.destinationPath, "grammars")
    for (const child of fs.readdirSync(sourceSyntaxes)) {
      const childPath = path.join(sourceSyntaxes, child)
      if (fs.isFileSync(childPath)) {
        this.convertFile(childPath, destination)
      }
    }

    return this.normalizeFilenames(destination)
  }
}
