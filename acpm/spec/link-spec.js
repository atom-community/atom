const fs = require("fysh")
const path = require("path")
const temp = require("temp")
const apm = require("../lib/apm-cli")

describe("apm link/unlink", function () {
  beforeEach(function () {
    spyOnConsole()
    return spyOnToken()
  })

  describe("when the dev flag is false (the default)", () =>
    it("symlinks packages to $ATOM_HOME/packages", function () {
      const atomHome = temp.mkdirSync("apm-home-dir-")
      process.env.ATOM_HOME = atomHome
      const packageToLink = temp.mkdirSync("a-package-")
      process.chdir(packageToLink)
      const callback = jasmine.createSpy("callback")

      runs(() => apm.run(["link"], callback))

      waitsFor("waiting for link to complete", () => callback.callCount > 0)

      runs(function () {
        expect(fs.existsSync(path.join(atomHome, "packages", path.basename(packageToLink)))).toBeTruthy()
        expect(fs.realpathSync(path.join(atomHome, "packages", path.basename(packageToLink)))).toBe(
          fs.realpathSync(packageToLink)
        )

        callback.reset()
        return apm.run(["unlink"], callback)
      })

      waitsFor("waiting for unlink to complete", () => callback.callCount > 0)

      return runs(() =>
        expect(fs.existsSync(path.join(atomHome, "packages", path.basename(packageToLink)))).toBeFalsy()
      )
    }))

  describe("when the dev flag is true", () =>
    it("symlinks packages to $ATOM_HOME/dev/packages", function () {
      const atomHome = temp.mkdirSync("apm-home-dir-")
      process.env.ATOM_HOME = atomHome
      const packageToLink = temp.mkdirSync("a-package-")
      process.chdir(packageToLink)
      const callback = jasmine.createSpy("callback")

      runs(() => apm.run(["link", "--dev"], callback))

      waitsFor("waiting for link to complete", () => callback.callCount > 0)

      runs(function () {
        expect(fs.existsSync(path.join(atomHome, "dev", "packages", path.basename(packageToLink)))).toBeTruthy()
        expect(fs.realpathSync(path.join(atomHome, "dev", "packages", path.basename(packageToLink)))).toBe(
          fs.realpathSync(packageToLink)
        )

        callback.reset()
        return apm.run(["unlink", "--dev"], callback)
      })

      waitsFor("waiting for unlink to complete", () => callback.callCount > 0)

      return runs(() =>
        expect(fs.existsSync(path.join(atomHome, "dev", "packages", path.basename(packageToLink)))).toBeFalsy()
      )
    }))

  describe("when the hard flag is true", () =>
    it("unlinks the package from both $ATOM_HOME/packages and $ATOM_HOME/dev/packages", function () {
      const atomHome = temp.mkdirSync("apm-home-dir-")
      process.env.ATOM_HOME = atomHome
      const packageToLink = temp.mkdirSync("a-package-")
      process.chdir(packageToLink)
      const callback = jasmine.createSpy("callback")

      runs(() => apm.run(["link", "--dev"], callback))

      waitsFor("link --dev to complete", () => callback.callCount === 1)

      runs(() => apm.run(["link"], callback))

      waitsFor("link to complete", () => callback.callCount === 2)

      runs(() => apm.run(["unlink", "--hard"], callback))

      waitsFor("unlink --hard to complete", () => callback.callCount === 3)

      return runs(function () {
        expect(fs.existsSync(path.join(atomHome, "dev", "packages", path.basename(packageToLink)))).toBeFalsy()
        return expect(fs.existsSync(path.join(atomHome, "packages", path.basename(packageToLink)))).toBeFalsy()
      })
    }))

  describe("when the all flag is true", () =>
    it("unlinks all packages in $ATOM_HOME/packages and $ATOM_HOME/dev/packages", function () {
      const atomHome = temp.mkdirSync("apm-home-dir-")
      process.env.ATOM_HOME = atomHome
      const packageToLink1 = temp.mkdirSync("a-package-")
      const packageToLink2 = temp.mkdirSync("a-package-")
      const packageToLink3 = temp.mkdirSync("a-package-")
      const callback = jasmine.createSpy("callback")

      runs(() => apm.run(["link", "--dev", packageToLink1], callback))

      waitsFor("link --dev to complete", () => callback.callCount === 1)

      runs(function () {
        callback.reset()
        apm.run(["link", packageToLink2], callback)
        return apm.run(["link", packageToLink3], callback)
      })

      waitsFor("link to complee", () => callback.callCount === 2)

      runs(function () {
        callback.reset()
        expect(fs.existsSync(path.join(atomHome, "dev", "packages", path.basename(packageToLink1)))).toBeTruthy()
        expect(fs.existsSync(path.join(atomHome, "packages", path.basename(packageToLink2)))).toBeTruthy()
        expect(fs.existsSync(path.join(atomHome, "packages", path.basename(packageToLink3)))).toBeTruthy()
        return apm.run(["unlink", "--all"], callback)
      })

      waitsFor("unlink --all to complete", () => callback.callCount === 1)

      return runs(function () {
        expect(fs.existsSync(path.join(atomHome, "dev", "packages", path.basename(packageToLink1)))).toBeFalsy()
        expect(fs.existsSync(path.join(atomHome, "packages", path.basename(packageToLink2)))).toBeFalsy()
        return expect(fs.existsSync(path.join(atomHome, "packages", path.basename(packageToLink3)))).toBeFalsy()
      })
    }))

  describe("when the package name is numeric", () =>
    it("still links and unlinks normally", function () {
      const atomHome = temp.mkdirSync("apm-home-dir-")
      process.env.ATOM_HOME = atomHome
      const numericPackageName = temp.mkdirSync("42")
      const callback = jasmine.createSpy("callback")

      runs(() => apm.run(["link", numericPackageName], callback))

      waitsFor("link to complete", () => callback.callCount === 1)

      runs(function () {
        expect(fs.existsSync(path.join(atomHome, "packages", path.basename(numericPackageName)))).toBeTruthy()
        expect(fs.realpathSync(path.join(atomHome, "packages", path.basename(numericPackageName)))).toBe(
          fs.realpathSync(numericPackageName)
        )

        callback.reset()
        return apm.run(["unlink", numericPackageName], callback)
      })

      waitsFor("unlink to complete", () => callback.callCount === 1)

      return runs(() =>
        expect(fs.existsSync(path.join(atomHome, "packages", path.basename(numericPackageName)))).toBeFalsy()
      )
    }))

  describe("when the package name is set after --name", () =>
    it("still links and unlinks normally", function () {
      const atomHome = temp.mkdirSync("apm-home-dir-")
      process.env.ATOM_HOME = atomHome
      const packagePath = temp.mkdirSync("new-package")
      const packageName = "new-package-name"
      const callback = jasmine.createSpy("callback")

      runs(() => apm.run(["link", packagePath, "--name", packageName], callback))

      waitsFor("link to complete", () => callback.callCount === 1)

      runs(function () {
        expect(fs.existsSync(path.join(atomHome, "packages", packageName))).toBeTruthy()
        expect(fs.realpathSync(path.join(atomHome, "packages", packageName))).toBe(fs.realpathSync(packagePath))

        callback.reset()
        return apm.run(["unlink", packageName], callback)
      })

      waitsFor("unlink to complete", () => callback.callCount === 1)

      return runs(() => expect(fs.existsSync(path.join(atomHome, "packages", packageName))).toBeFalsy())
    }))

  describe("when unlinking a path that is not a symbolic link", () =>
    it("logs an error and exits", function () {
      const callback = jasmine.createSpy("callback")
      process.chdir(temp.mkdirSync("not-a-symlink"))
      apm.run(["unlink"], callback)

      waitsFor("waiting for command to complete", () => callback.callCount > 0)

      return runs(function () {
        expect(console.error.mostRecentCall.args[0].length).toBeGreaterThan(0)
        return expect(callback.mostRecentCall.args[0]).not.toBeUndefined()
      })
    }))

  return describe("when unlinking a path that does not exist", () =>
    it("logs an error and exits", function () {
      const callback = jasmine.createSpy("callback")
      apm.run(["unlink", "a-path-that-does-not-exist"], callback)

      waitsFor("waiting for command to complete", () => callback.callCount > 0)

      return runs(function () {
        expect(console.error.mostRecentCall.args[0].length).toBeGreaterThan(0)
        return expect(callback.mostRecentCall.args[0]).not.toBeUndefined()
      })
    }))
})
