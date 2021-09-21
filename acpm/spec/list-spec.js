const path = require("path")
const temp = require("temp")
const fs = require("fysh")
const apm = require("../lib/apm-cli")
const CSON = require("season")

const listPackages = function (args, doneCallback) {
  const callback = jasmine.createSpy("callback")
  apm.run(["list"].concat(args), callback)

  waitsFor(() => callback.callCount === 1)

  return runs(doneCallback)
}

const createFakePackage = function (type, metadata) {
  const packagesFolder = (() => {
    switch (type) {
      case "user":
      case "git":
        return "packages"
      case "dev":
        return path.join("dev", "packages")
    }
  })()
  const targetFolder = path.join(process.env.ATOM_HOME, packagesFolder, metadata.name)
  fs.makeTreeSync(targetFolder)
  return fs.writeFileSync(path.join(targetFolder, "package.json"), JSON.stringify(metadata))
}

const removeFakePackage = function (type, name) {
  const packagesFolder = (() => {
    switch (type) {
      case "user":
      case "git":
        return "packages"
      case "dev":
        return path.join("dev", "packages")
    }
  })()
  const targetFolder = path.join(process.env.ATOM_HOME, packagesFolder, name)
  return fs.removeSync(targetFolder)
}

describe("apm list", function () {
  let [resourcePath, atomHome] = Array.from([])

  beforeEach(function () {
    spyOnConsole()
    spyOnToken()

    resourcePath = temp.mkdirSync("apm-resource-path-")
    const atomPackages = {
      "test-module": {
        metadata: {
          name: "test-module",
          version: "1.0.0",
        },
      },
    }
    fs.writeFileSync(path.join(resourcePath, "package.json"), JSON.stringify({ _atomPackages: atomPackages }))
    process.env.ATOM_RESOURCE_PATH = resourcePath
    atomHome = temp.mkdirSync("apm-home-dir-")
    process.env.ATOM_HOME = atomHome

    createFakePackage("user", {
      name: "user-package",
      version: "1.0.0",
    })
    createFakePackage("dev", {
      name: "dev-package",
      version: "1.0.0",
    })
    createFakePackage("git", {
      name: "git-package",
      version: "1.0.0",
      apmInstallSource: {
        type: "git",
        source: "git+ssh://git@github.com:user/repo.git",
        sha: "abcdef1234567890",
      },
    })

    const badPackagePath = path.join(process.env.ATOM_HOME, "packages", ".bin")
    fs.makeTreeSync(badPackagePath)
    return fs.writeFileSync(path.join(badPackagePath, "file.txt"), "some fake stuff")
  })

  it("lists the installed packages", () =>
    listPackages([], function () {
      const lines = console.log.argsForCall.map((arr) => arr.join(" "))
      expect(lines[0]).toMatch(/Built-in Atom Packages.*1/)
      expect(lines[1]).toMatch(/test-module@1\.0\.0/)
      expect(lines[3]).toMatch(/Dev Packages.*1/)
      expect(lines[4]).toMatch(/dev-package@1\.0\.0/)
      expect(lines[6]).toMatch(/Community Packages.*1/)
      expect(lines[7]).toMatch(/user-package@1\.0\.0/)
      expect(lines[9]).toMatch(/Git Packages.*1/)
      expect(lines[10]).toMatch(/git-package@1\.0\.0/)
      return expect(lines.join("\n")).not.toContain(".bin")
    })) // ensure invalid packages aren't listed

  it("lists the installed packages without versions with --no-versions", () =>
    listPackages(["--no-versions"], function () {
      const lines = console.log.argsForCall.map((arr) => arr.join(" "))
      expect(lines[0]).toMatch(/Built-in Atom Packages.*1/)
      expect(lines[1]).toMatch(/test-module/)
      expect(lines[3]).toMatch(/Dev Packages.*1/)
      expect(lines[4]).toMatch(/dev-package/)
      expect(lines[6]).toMatch(/Community Packages.*1/)
      expect(lines[7]).toMatch(/user-package/)
      expect(lines[9]).toMatch(/Git Packages.*1/)
      expect(lines[10]).toMatch(/git-package/)
      return expect(lines.join("\n")).not.toContain(".bin")
    })) // ensure invalid packages aren't listed

  describe("enabling and disabling packages", function () {
    beforeEach(function () {
      const packagesPath = path.join(atomHome, "packages")
      fs.makeTreeSync(packagesPath)
      fs.copySync(
        path.join(__dirname, "fixtures", "test-module"),
        path.join(packagesPath, "test-module")
      )
      const configPath = path.join(atomHome, "config.cson")
      return CSON.writeFileSync(configPath, {
        "*": {
          core: { disabledPackages: ["test-module"] },
        },
      })
    })

    it("labels disabled packages", () =>
      listPackages([], () => expect(console.log.argsForCall[1][0]).toContain("test-module@1.0.0 (disabled)")))

    it("displays only disabled packages when --disabled is called", () =>
      listPackages(["--disabled"], function () {
        expect(console.log.argsForCall[1][0]).toMatch(/test-module@1\.0\.0$/)
        return expect(console.log.argsForCall.toString()).not.toContain(["user-package"])
      }))

    return it("displays only enabled packages when --enabled is called", () =>
      listPackages(["--enabled"], function () {
        expect(console.log.argsForCall[7][0]).toMatch(/user-package@1\.0\.0$/)
        return expect(console.log.argsForCall.toString()).not.toContain(["test-module"])
      }))
  })

  it("lists packages in json format when --json is passed", () =>
    listPackages(["--json"], function () {
      const json = JSON.parse(console.log.argsForCall[0][0])
      const apmInstallSource = {
        type: "git",
        source: "git+ssh://git@github.com:user/repo.git",
        sha: "abcdef1234567890",
      }
      expect(json.core).toEqual([{ name: "test-module", version: "1.0.0" }])
      expect(json.dev).toEqual([{ name: "dev-package", version: "1.0.0" }])
      expect(json.git).toEqual([{ name: "git-package", version: "1.0.0", apmInstallSource }])
      return expect(json.user).toEqual([{ name: "user-package", version: "1.0.0" }])
    }))

  it("lists packages in bare format when --bare is passed", () =>
    listPackages(["--bare"], function () {
      const lines = console.log.argsForCall.map((arr) => arr.join(" "))
      expect(lines[0]).toMatch(/test-module@1\.0\.0/)
      expect(lines[1]).toMatch(/dev-package@1\.0\.0/)
      expect(lines[2]).toMatch(/user-package@1\.0\.0/)
      return expect(lines[3]).toMatch(/git-package@1\.0\.0/)
    }))

  it("list packages in bare format without versions when --bare --no-versions is passed", () =>
    listPackages(["--bare", "--no-versions"], function () {
      const lines = console.log.argsForCall.map((arr) => arr.join(" "))
      expect(lines[0]).toMatch(/test-module/)
      expect(lines[1]).toMatch(/dev-package/)
      expect(lines[2]).toMatch(/user-package/)
      return expect(lines[3]).toMatch(/git-package/)
    }))

  return describe("when a section is empty", function () {
    it("does not list anything for Dev and Git sections", function () {
      removeFakePackage("git", "git-package")
      removeFakePackage("dev", "dev-package")
      return listPackages([], function () {
        const output = console.log.argsForCall.map((arr) => arr.join(" ")).join("\n")
        expect(output).not.toMatch(/Git Packages/)
        expect(output).not.toMatch(/git-package/)
        expect(output).not.toMatch(/Dev Packages.*1/)
        expect(output).not.toMatch(/dev-package@1\.0\.0/)
        return expect(output).not.toMatch(/(empty)/)
      })
    })

    return it('displays "empty" for User section', function () {
      removeFakePackage("user", "user-package")
      return listPackages([], function () {
        const lines = console.log.argsForCall.map((arr) => arr.join(" "))
        expect(lines[0]).toMatch(/Built-in Atom Packages.*1/)
        expect(lines[1]).toMatch(/test-module@1\.0\.0/)
        expect(lines[3]).toMatch(/Dev Packages.*1/)
        expect(lines[4]).toMatch(/dev-package@1\.0\.0/)
        expect(lines[6]).toMatch(/Community Packages.*0/)
        expect(lines[7]).toMatch(/(empty)/)
        expect(lines[9]).toMatch(/Git Packages.*1/)
        expect(lines[10]).toMatch(/git-package@1\.0\.0/)
        return expect(lines.join("\n")).not.toContain(".bin")
      })
    })
  })
}) // ensure invalid packages aren't listed
