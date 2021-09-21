const path = require("path")
const temp = require("temp")
const CSON = require("season")
const apm = require("../lib/apm-cli")
const fs = require("fysh")

describe("apm init", function () {
  let [packagePath, themePath, languagePath] = Array.from([])

  beforeEach(function () {
    spyOnConsole()
    spyOnToken()

    const currentDir = temp.mkdirSync("apm-init-")
    spyOn(process, "cwd").andReturn(currentDir)
    packagePath = path.join(currentDir, "fake-package")
    themePath = path.join(currentDir, "fake-theme")
    languagePath = path.join(currentDir, "language-fake")
    return (process.env.GITHUB_USER = "somebody")
  })

  describe("when creating a package", function () {
    describe("when package syntax is CoffeeScript", () =>
      it("generates the proper file structure", function () {
        const callback = jasmine.createSpy("callback")
        apm.run(["init", "--package", "fake-package"], callback)

        waitsFor("waiting for init to complete", () => callback.callCount === 1)

        return runs(function () {
          expect(fs.existsSync(packagePath)).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, "keymaps"))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, "keymaps", "fake-package.cson"))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, "lib"))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, "lib", "fake-package-view.coffee"))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, "lib", "fake-package.coffee"))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, "menus"))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, "menus", "fake-package.cson"))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, "spec", "fake-package-view-spec.coffee"))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, "spec", "fake-package-spec.coffee"))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, "styles", "fake-package.less"))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, "package.json"))).toBeTruthy()
          expect(JSON.parse(fs.readFileSync(path.join(packagePath, "package.json"))).name).toBe("fake-package")
          return expect(JSON.parse(fs.readFileSync(path.join(packagePath, "package.json"))).repository).toBe(
            "https://github.com/somebody/fake-package"
          )
        })
      }))

    describe("when package syntax is JavaScript", () =>
      it("generates the proper file structure", function () {
        const callback = jasmine.createSpy("callback")
        apm.run(["init", "--syntax", "javascript", "--package", "fake-package"], callback)

        waitsFor("waiting for init to complete", () => callback.callCount === 1)

        return runs(function () {
          expect(fs.existsSync(packagePath)).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, "keymaps"))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, "keymaps", "fake-package.json"))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, "lib"))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, "lib", "fake-package-view.js"))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, "lib", "fake-package.js"))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, "menus"))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, "menus", "fake-package.json"))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, "spec", "fake-package-view-spec.js"))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, "spec", "fake-package-spec.js"))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, "styles", "fake-package.less"))).toBeTruthy()
          expect(fs.existsSync(path.join(packagePath, "package.json"))).toBeTruthy()
          expect(JSON.parse(fs.readFileSync(path.join(packagePath, "package.json"))).name).toBe("fake-package")
          return expect(JSON.parse(fs.readFileSync(path.join(packagePath, "package.json"))).repository).toBe(
            "https://github.com/somebody/fake-package"
          )
        })
      }))

    describe("when package syntax is unsupported", () =>
      it("logs an error", function () {
        const callback = jasmine.createSpy("callback")
        apm.run(["init", "--syntax", "something-unsupported", "--package", "fake-package"], callback)

        waitsFor("waiting for init to complete", () => callback.callCount === 1)

        return runs(() => expect(callback.argsForCall[0][0].length).toBeGreaterThan(0))
      }))

    return describe("when converting a TextMate bundle", function () {
      beforeEach(function () {
        const callback = jasmine.createSpy("callback")
        const textMateBundlePath = path.join(__dirname, "fixtures", "r.tmbundle")
        apm.run(["init", "--package", "fake-package", "--convert", textMateBundlePath], callback)

        return waitsFor("waiting for init to complete", () => callback.callCount === 1)
      })

      it("generates the proper file structure", function () {
        expect(fs.existsSync(packagePath)).toBeTruthy()
        expect(fs.isFileSync(path.join(packagePath, "settings", "fake-package.cson"))).toBe(true)
        expect(fs.isFileSync(path.join(packagePath, "snippets", "fake-package.cson"))).toBe(true)
        expect(fs.isFileSync(path.join(packagePath, "grammars", "r.cson"))).toBe(true)
        expect(fs.existsSync(path.join(packagePath, "command"))).toBeFalsy()
        expect(fs.existsSync(path.join(packagePath, "README.md"))).toBeTruthy()
        expect(fs.existsSync(path.join(packagePath, "package.json"))).toBeTruthy()
        expect(fs.existsSync(path.join(packagePath, "LICENSE.md"))).toBeFalsy()
        expect(JSON.parse(fs.readFileSync(path.join(packagePath, "package.json"))).name).toBe("fake-package")
        expect(JSON.parse(fs.readFileSync(path.join(packagePath, "package.json"))).repository).toBe(
          "https://github.com/somebody/fake-package"
        )
        expect(
          CSON.readFileSync(path.join(packagePath, "snippets", "fake-package.cson"))[".source.rd.tm"].Attach
        ).toEqual({
          body: "attach($1) *outlet",
          prefix: "att",
        })
        return expect(
          CSON.readFileSync(path.join(packagePath, "settings", "fake-package.cson"))[".source.r"].editor
        ).toEqual({
          decreaseIndentPattern: "^\\s*\\}",
          foldEndPattern: "(^\\s*\\)|^\\s*\\})",
          commentStart: "# ",
        })
      })

      return it("unescapes escaped dollar signs `$` in snippets", function () {
        let forLoopBody = CSON.readFileSync(path.join(packagePath, "snippets", "fake-package.cson"))[".source.perl"][
          "For Loop"
        ].body
        forLoopBody = forLoopBody.replace(/\r?\n/g, "\n")
        return expect(forLoopBody).toBe(`\
for (my $\${1:var} = 0; $$1 < \${2:expression}; $$1++) {
\t\${3:# body...}
}
\
`)
      })
    })
  })

  describe("when creating a theme", function () {
    it("generates the proper file structure", function () {
      const callback = jasmine.createSpy("callback")
      apm.run(["init", "--theme", "fake-theme"], callback)

      waitsFor("waiting for init to complete", () => callback.callCount === 1)

      return runs(function () {
        expect(fs.existsSync(themePath)).toBeTruthy()
        expect(fs.existsSync(path.join(themePath, "styles"))).toBeTruthy()
        expect(fs.existsSync(path.join(themePath, "styles", "colors.less"))).toBeTruthy()
        expect(fs.existsSync(path.join(themePath, "styles", "syntax-variables.less"))).toBeTruthy()
        expect(fs.existsSync(path.join(themePath, "styles", "syntax.less"))).toBeTruthy()
        expect(fs.existsSync(path.join(themePath, "styles", "editor.less"))).toBeTruthy()
        expect(fs.existsSync(path.join(themePath, "index.less"))).toBeTruthy()
        expect(fs.existsSync(path.join(themePath, "README.md"))).toBeTruthy()
        expect(fs.existsSync(path.join(themePath, "package.json"))).toBeTruthy()
        expect(JSON.parse(fs.readFileSync(path.join(themePath, "package.json"))).name).toBe("fake-theme")
        return expect(JSON.parse(fs.readFileSync(path.join(themePath, "package.json"))).repository).toBe(
          "https://github.com/somebody/fake-theme"
        )
      })
    })

    return describe("when converting a TextMate theme", function () {
      it("generates the proper file structure", function () {
        const callback = jasmine.createSpy("callback")
        const textMateThemePath = path.join(__dirname, "fixtures", "Dawn.tmTheme")
        apm.run(["init", "--theme", "fake-theme", "--convert", textMateThemePath], callback)

        waitsFor("waiting for init to complete", () => callback.callCount === 1)

        return runs(function () {
          expect(fs.existsSync(themePath)).toBeTruthy()
          expect(fs.existsSync(path.join(themePath, "styles"))).toBeTruthy()
          expect(fs.readFileSync(path.join(themePath, "styles", "syntax-variables.less"), "utf8")).toContain(`\
@syntax-gutter-text-color: #080808;
@syntax-gutter-text-color-selected: #080808;
@syntax-gutter-background-color: #F5F5F5;
@syntax-gutter-background-color-selected: rgba(0, 108, 125, 0.07);\
`)
          expect(fs.readFileSync(path.join(themePath, "styles", "base.less"), "utf8")).toContain(`\
@import "syntax-variables";

atom-text-editor {
  background-color: @syntax-background-color;
  color: @syntax-text-color;
}

atom-text-editor .gutter {
  background-color: @syntax-gutter-background-color;
  color: @syntax-gutter-text-color;
}\
`)
          expect(fs.existsSync(path.join(themePath, "README.md"))).toBeTruthy()
          expect(fs.existsSync(path.join(themePath, "package.json"))).toBeTruthy()
          expect(fs.existsSync(path.join(themePath, "LICENSE.md"))).toBeFalsy()
          expect(JSON.parse(fs.readFileSync(path.join(themePath, "package.json"))).name).toBe("fake-theme")
          return expect(JSON.parse(fs.readFileSync(path.join(themePath, "package.json"))).repository).toBe(
            "https://github.com/somebody/fake-theme"
          )
        })
      })

      return it("logs an error if it doesn't have all the required color settings", function () {
        const callback = jasmine.createSpy("callback")
        const textMateThemePath = path.join(__dirname, "fixtures", "Bad.tmTheme")
        apm.run(["init", "--theme", "fake-theme", "--convert", textMateThemePath], callback)

        waitsFor("waiting for init to complete", () => callback.callCount === 1)

        return runs(() => expect(callback.argsForCall[0][0].message.length).toBeGreaterThan(0))
      })
    })
  })

  return describe("when creating a language", function () {
    it("generates the proper file structure", function () {
      const callback = jasmine.createSpy("callback")
      apm.run(["init", "--language", "fake"], callback)

      waitsFor("waiting for init to complete", () => callback.callCount === 1)

      return runs(function () {
        expect(fs.existsSync(languagePath)).toBeTruthy()
        expect(fs.existsSync(path.join(languagePath, "grammars", "fake.cson"))).toBeTruthy()
        expect(fs.existsSync(path.join(languagePath, "settings", "language-fake.cson"))).toBeTruthy()
        expect(fs.existsSync(path.join(languagePath, "snippets", "language-fake.cson"))).toBeTruthy()
        expect(fs.existsSync(path.join(languagePath, "spec", "language-fake-spec.coffee"))).toBeTruthy()
        expect(fs.existsSync(path.join(languagePath, "package.json"))).toBeTruthy()
        expect(JSON.parse(fs.readFileSync(path.join(languagePath, "package.json"))).name).toBe("language-fake")
        return expect(JSON.parse(fs.readFileSync(path.join(languagePath, "package.json"))).repository).toBe(
          "https://github.com/somebody/language-fake"
        )
      })
    })

    return it("does not add language prefix to name if already present", function () {
      const callback = jasmine.createSpy("callback")
      apm.run(["init", "--language", "language-fake"], callback)

      waitsFor("waiting for init to complete", () => callback.callCount === 1)

      return runs(() => expect(fs.existsSync(languagePath)).toBeTruthy())
    })
  })
})
