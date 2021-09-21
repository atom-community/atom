const fs = require("fysh")
const path = require("path")
const temp = require("temp")
const CSON = require("season")

const apm = require("../lib/apm-cli")

describe("apm disable", function () {
  beforeEach(function () {
    spyOnConsole()
    return spyOnToken()
  })

  it("disables an enabled package", function () {
    const atomHome = temp.mkdirSync("apm-home-dir-")
    process.env.ATOM_HOME = atomHome
    const callback = jasmine.createSpy("callback")
    const configFilePath = path.join(atomHome, "config.cson")

    CSON.writeFileSync(configFilePath, {
      "*": {
        core: {
          disabledPackages: ["test-module"],
        },
      },
    })

    const packagesPath = path.join(atomHome, "packages")
    const packageSrcPath = path.join(__dirname, "fixtures")
    fs.makeTreeSync(packagesPath)
    fs.copySync(path.join(packageSrcPath, "test-module"), path.join(packagesPath, "test-module"))
    fs.copySync(
      path.join(packageSrcPath, "test-module-two"),
      path.join(packagesPath, "test-module-two")
    )
    fs.copySync(
      path.join(packageSrcPath, "test-module-three"),
      path.join(packagesPath, "test-module-three")
    )

    runs(() => apm.run(["disable", "test-module-two", "not-installed", "test-module-three"], callback))

    waitsFor("waiting for disable to complete", () => callback.callCount > 0)

    return runs(function () {
      expect(console.log).toHaveBeenCalled()
      expect(console.log.argsForCall[0][0]).toMatch(/Not Installed:\s*not-installed/)
      expect(console.log.argsForCall[1][0]).toMatch(/Disabled:\s*test-module-two/)

      const config = CSON.readFileSync(configFilePath)
      return expect(config).toEqual({
        "*": {
          core: {
            disabledPackages: ["test-module", "test-module-two", "test-module-three"],
          },
        },
      })
    })
  })

  it("does nothing if a package is already disabled", function () {
    const atomHome = temp.mkdirSync("apm-home-dir-")
    process.env.ATOM_HOME = atomHome
    const callback = jasmine.createSpy("callback")
    const configFilePath = path.join(atomHome, "config.cson")

    CSON.writeFileSync(configFilePath, {
      "*": {
        core: {
          disabledPackages: ["vim-mode", "file-icons", "metrics", "exception-reporting"],
        },
      },
    })

    runs(() => apm.run(["disable", "vim-mode", "metrics"], callback))

    waitsFor("waiting for disable to complete", () => callback.callCount > 0)

    return runs(function () {
      const config = CSON.readFileSync(configFilePath)
      return expect(config).toEqual({
        "*": {
          core: {
            disabledPackages: ["vim-mode", "file-icons", "metrics", "exception-reporting"],
          },
        },
      })
    })
  })

  it("produces an error if config.cson doesn't exist", function () {
    const atomHome = temp.mkdirSync("apm-home-dir-")
    process.env.ATOM_HOME = atomHome
    const callback = jasmine.createSpy("callback")

    runs(() => apm.run(["disable", "vim-mode"], callback))

    waitsFor("waiting for disable to complete", () => callback.callCount > 0)

    return runs(function () {
      expect(console.error).toHaveBeenCalled()
      return expect(console.error.argsForCall[0][0].length).toBeGreaterThan(0)
    })
  })

  return it("complains if user supplies no packages", function () {
    const atomHome = temp.mkdirSync("apm-home-dir-")
    process.env.ATOM_HOME = atomHome
    const callback = jasmine.createSpy("callback")

    runs(() => apm.run(["disable"], callback))

    waitsFor("waiting for disable to complete", () => callback.callCount > 0)

    return runs(function () {
      expect(console.error).toHaveBeenCalled()
      return expect(console.error.argsForCall[0][0].length).toBeGreaterThan(0)
    })
  })
})
