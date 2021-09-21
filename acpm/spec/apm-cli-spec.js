const path = require("path")
const temp = require("temp")
const fs = require("fysh")
const apm = require("../lib/apm-cli")

describe("apm command line interface", function () {
  beforeEach(function () {
    spyOnConsole()
    return spyOnToken()
  })

  describe("when no arguments are present", () =>
    it("prints a usage message", function () {
      apm.run([])
      expect(console.log).not.toHaveBeenCalled()
      expect(console.error).toHaveBeenCalled()
      return expect(console.error.argsForCall[0][0].length).toBeGreaterThan(0)
    }))

  describe("when the help flag is specified", () =>
    it("prints a usage message", function () {
      apm.run(["-h"])
      expect(console.log).not.toHaveBeenCalled()
      expect(console.error).toHaveBeenCalled()
      return expect(console.error.argsForCall[0][0].length).toBeGreaterThan(0)
    }))

  describe("when the version flag is specified", () =>
    it("prints the version", function () {
      const callback = jasmine.createSpy("callback")
      apm.run(["-v", "--no-color"], callback)

      const testAtomVersion = "0.0.0"
      const tempAtomResourcePath = temp.mkdirSync("apm-resource-dir-")
      fs.writeFileSync(path.join(tempAtomResourcePath, "package.json"), JSON.stringify({ version: testAtomVersion }))
      process.env.ATOM_RESOURCE_PATH = tempAtomResourcePath

      waitsFor(() => callback.callCount === 1)

      return runs(function () {
        expect(console.error).not.toHaveBeenCalled()
        expect(console.log).toHaveBeenCalled()
        const lines = console.log.argsForCall[0][0].split("\n")
        expect(lines[0]).toBe(`apm  ${require("../package.json").version}`)
        expect(lines[1]).toBe(`npm  ${require("npm/package.json").version}`)
        expect(lines[2]).toBe(`node ${process.versions.node} ${process.arch}`)
        return expect(lines[3]).toBe(`atom ${testAtomVersion}`)
      })
    }))

  describe("when the version flag is specified but env.ATOM_RESOURCE_PATH is not set", function () {
    it("finds the installed Atom and prints the version", function () {
      const callback = jasmine.createSpy("callback")
      apm.run(["-v", "--no-color"], callback)

      process.env.ATOM_RESOURCE_PATH = ""

      waitsFor(() => callback.callCount === 1)

      return runs(function () {
        expect(console.error).not.toHaveBeenCalled()
        expect(console.log).toHaveBeenCalled()
        const lines = console.log.argsForCall[0][0].split("\n")
        expect(lines[0]).toBe(`apm  ${require("../package.json").version}`)
        expect(lines[1]).toBe(`npm  ${require("npm/package.json").version}`)
        return expect(lines[2]).toBe(`node ${process.versions.node} ${process.arch}`)
      })
    })

    return describe("when the version flag is specified and apm is unable find package.json on the resourcePath", () =>
      it("prints unknown atom version", function () {
        const callback = jasmine.createSpy("callback")
        apm.run(["-v", "--no-color"], callback)

        const testAtomVersion = "unknown"
        const tempAtomResourcePath = temp.mkdirSync("apm-resource-dir-")
        process.env.ATOM_RESOURCE_PATH = tempAtomResourcePath

        waitsFor(() => callback.callCount === 1)

        return runs(function () {
          expect(console.error).not.toHaveBeenCalled()
          expect(console.log).toHaveBeenCalled()
          const lines = console.log.argsForCall[0][0].split("\n")
          return expect(lines[3]).toBe(`atom ${testAtomVersion}`)
        })
      }))
  })

  return describe("when an unrecognized command is specified", () =>
    it("prints an error message and exits", function () {
      const callback = jasmine.createSpy("callback")
      apm.run(["this-will-never-be-a-command"], callback)
      expect(console.log).not.toHaveBeenCalled()
      expect(console.error).toHaveBeenCalled()
      expect(console.error.argsForCall[0][0].length).toBeGreaterThan(0)
      return expect(callback.mostRecentCall.args[0]).not.toBeUndefined()
    }))
})
