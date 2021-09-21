const apm = require("../lib/apm-cli")

describe("command help", function () {
  beforeEach(function () {
    spyOnToken()
    return spyOnConsole()
  })

  describe("apm help publish", () =>
    it("displays the help for the command", function () {
      const callback = jasmine.createSpy("callback")
      apm.run(["help", "publish"], callback)

      waitsFor("waiting for help to complete", 60000, () => callback.callCount === 1)

      return runs(function () {
        expect(console.error.callCount).toBeGreaterThan(0)
        return expect(callback.mostRecentCall.args[0]).toBeUndefined()
      })
    }))

  describe("apm publish -h", () =>
    it("displays the help for the command", function () {
      const callback = jasmine.createSpy("callback")
      apm.run(["publish", "-h"], callback)

      waitsFor("waiting for help to complete", 60000, () => callback.callCount === 1)

      return runs(function () {
        expect(console.error.callCount).toBeGreaterThan(0)
        return expect(callback.mostRecentCall.args[0]).toBeUndefined()
      })
    }))

  describe("apm help", () =>
    it("displays the help for apm", function () {
      const callback = jasmine.createSpy("callback")
      apm.run(["help"], callback)

      waitsFor("waiting for help to complete", 60000, () => callback.callCount === 1)

      return runs(function () {
        expect(console.error.callCount).toBeGreaterThan(0)
        return expect(callback.mostRecentCall.args[0]).toBeUndefined()
      })
    }))

  return describe("apm", () =>
    it("displays the help for apm", function () {
      const callback = jasmine.createSpy("callback")
      apm.run([], callback)

      waitsFor("waiting for help to complete", 60000, () => callback.callCount === 1)

      return runs(function () {
        expect(console.error.callCount).toBeGreaterThan(0)
        return expect(callback.mostRecentCall.args[0]).toBeUndefined()
      })
    }))
})
