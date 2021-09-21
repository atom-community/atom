const Packages = require("../lib/packages")

describe("getRemote", function () {
  it("returns origin if remote could not be determined", () => expect(Packages.getRemote()).toEqual("origin"))

  it("returns repository.url", function () {
    const pack = {
      repository: {
        type: "git",
        url: "https://github.com/atom/apm.git",
      },
    }
    return expect(Packages.getRemote(pack)).toEqual(pack.repository.url)
  })

  return it("returns repository", function () {
    const pack = { repository: "https://github.com/atom/apm" }
    return expect(Packages.getRemote(pack)).toEqual(pack.repository)
  })
})
