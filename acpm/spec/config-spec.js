const path = require("path")
const fs = require("fysh")
const temp = require("temp")
const apm = require("../lib/apm-cli")

describe("apm config", function () {
  let [atomHome, userConfigPath] = Array.from([])

  beforeEach(function () {
    spyOnToken()
    spyOnConsole()

    atomHome = temp.mkdirSync("apm-home-dir-")
    process.env.ATOM_HOME = atomHome
    userConfigPath = path.join(atomHome, ".apmrc")

    // Make sure the cache used is the one for the test env
    return delete process.env.npm_config_cache
  })

  describe("apm config get", () =>
    it("reads the value from the global config when there is no user config", function () {
      const callback = jasmine.createSpy("callback")
      apm.run(["config", "get", "cache"], callback)

      waitsFor("waiting for config get to complete", 600000, () => callback.callCount === 1)

      return runs(() =>
        expect(process.stdout.write.argsForCall[0][0].trim()).toBe(path.join(process.env.ATOM_HOME, ".apm"))
      )
    }))

  return describe("apm config set", () =>
    it("sets the value in the user config", function () {
      expect(fs.isFileSync(userConfigPath)).toBe(false)

      const callback = jasmine.createSpy("callback")
      apm.run(["config", "set", "foo", "bar"], callback)

      waitsFor("waiting for config set to complete", 600000, () => callback.callCount === 1)

      runs(function () {
        expect(fs.isFileSync(userConfigPath)).toBe(true)

        callback.reset()
        return apm.run(["config", "get", "foo"], callback)
      })

      waitsFor("waiting for config get to complete", 600000, () => callback.callCount === 1)

      return runs(() => expect(process.stdout.write.argsForCall[0][0].trim()).toBe("bar"))
    }))
})
