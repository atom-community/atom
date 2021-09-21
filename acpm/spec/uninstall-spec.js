const path = require("path")
const fs = require("fysh")
const temp = require("temp")
const apm = require("../lib/apm-cli")

const createPackage = function (packageName, includeDev = false) {
  let devPackagePath
  const atomHome = temp.mkdirSync("apm-home-dir-")
  const packagePath = path.join(atomHome, "packages", packageName)
  fs.makeTreeSync(path.join(packagePath, "lib"))
  fs.writeFileSync(path.join(packagePath, "package.json"), "{}")
  if (includeDev) {
    devPackagePath = path.join(atomHome, "dev", "packages", packageName)
    fs.makeTreeSync(path.join(devPackagePath, "lib"))
    fs.writeFileSync(path.join(devPackagePath, "package.json"), "{}")
  }
  process.env.ATOM_HOME = atomHome
  return { packagePath, devPackagePath }
}

describe("apm uninstall", function () {
  beforeEach(function () {
    spyOnConsole()
    spyOnToken()
    return (process.env.ATOM_API_URL = "http://localhost:5432")
  })

  describe("when no package is specified", () =>
    it("logs an error and exits", function () {
      const callback = jasmine.createSpy("callback")
      apm.run(["uninstall"], callback)

      waitsFor("waiting for command to complete", () => callback.callCount > 0)

      return runs(function () {
        expect(console.error.mostRecentCall.args[0].length).toBeGreaterThan(0)
        return expect(callback.mostRecentCall.args[0]).not.toBeUndefined()
      })
    }))

  describe("when the package is not installed", () =>
    it("ignores the package", function () {
      const callback = jasmine.createSpy("callback")
      apm.run(["uninstall", "a-package-that-does-not-exist"], callback)

      waitsFor("waiting for command to complete", () => callback.callCount > 0)

      return runs(() => expect(console.error.callCount).toBe(1))
    }))

  describe("when the package is installed", () =>
    it("deletes the package", function () {
      const { packagePath } = createPackage("test-package")

      expect(fs.existsSync(packagePath)).toBeTruthy()
      const callback = jasmine.createSpy("callback")
      apm.run(["uninstall", "test-package"], callback)

      waitsFor("waiting for command to complete", () => callback.callCount > 0)

      return runs(() => expect(fs.existsSync(packagePath)).toBeFalsy())
    }))

  return describe("when the package folder exists but does not contain a package.json", function () {
    it("does not delete the folder", function () {
      const { packagePath } = createPackage("test-package")
      fs.unlinkSync(path.join(packagePath, "package.json"))

      const callback = jasmine.createSpy("callback")
      apm.run(["uninstall", "test-package"], callback)

      waitsFor("waiting for command to complete", () => callback.callCount > 0)

      return runs(() => expect(fs.existsSync(packagePath)).toBeTruthy())
    })

    describe("when . is specified as the package name", () =>
      it("resolves to the basename of the cwd", function () {
        const { packagePath } = createPackage("test-package")

        expect(fs.existsSync(packagePath)).toBeTruthy()

        const oldCwd = process.cwd()
        process.chdir(packagePath)

        const callback = jasmine.createSpy("callback")
        apm.run(["uninstall", "."], callback)

        waitsFor("waiting for command to complete", () => callback.callCount > 0)

        return runs(function () {
          expect(fs.existsSync(packagePath)).toBeFalsy()
          return process.chdir(oldCwd)
        })
      }))

    describe("--dev", () =>
      it("deletes the packages from the dev packages folder", function () {
        const { packagePath, devPackagePath } = createPackage("test-package", true)

        expect(fs.existsSync(packagePath)).toBeTruthy()
        const callback = jasmine.createSpy("callback")
        apm.run(["uninstall", "test-package", "--dev"], callback)

        waitsFor("waiting for command to complete", () => callback.callCount > 0)

        return runs(function () {
          expect(fs.existsSync(devPackagePath)).toBeFalsy()
          return expect(fs.existsSync(packagePath)).toBeTruthy()
        })
      }))

    return describe("--hard", () =>
      it("deletes the packages from the both packages folders", function () {
        const atomHome = temp.mkdirSync("apm-home-dir-")
        const packagePath = path.join(atomHome, "packages", "test-package")
        fs.makeTreeSync(path.join(packagePath, "lib"))
        fs.writeFileSync(path.join(packagePath, "package.json"), "{}")
        const devPackagePath = path.join(atomHome, "dev", "packages", "test-package")
        fs.makeTreeSync(path.join(devPackagePath, "lib"))
        fs.writeFileSync(path.join(devPackagePath, "package.json"), "{}")
        process.env.ATOM_HOME = atomHome

        expect(fs.existsSync(packagePath)).toBeTruthy()
        const callback = jasmine.createSpy("callback")
        apm.run(["uninstall", "test-package", "--hard"], callback)

        waitsFor("waiting for command to complete", () => callback.callCount > 0)

        return runs(function () {
          expect(fs.existsSync(devPackagePath)).toBeFalsy()
          return expect(fs.existsSync(packagePath)).toBeFalsy()
        })
      }))
  })
})
