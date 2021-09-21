const path = require("path")
const express = require("express")
const http = require("http")
const apm = require("../lib/apm-cli")

describe("apm featured", function () {
  let server = null

  beforeEach(function () {
    spyOnConsole()
    spyOnToken()

    const app = express()
    app.get("/packages/featured", (request, response) =>
      response.sendFile(path.join(__dirname, "fixtures", "packages.json"))
    )
    app.get("/themes/featured", (request, response) =>
      response.sendFile(path.join(__dirname, "fixtures", "themes.json"))
    )
    server = http.createServer(app)

    let live = false
    server.listen(3000, "127.0.0.1", function () {
      process.env.ATOM_API_URL = "http://localhost:3000"
      return (live = true)
    })
    return waitsFor(() => live)
  })

  afterEach(function () {
    let done = false
    server.close(() => (done = true))
    return waitsFor(() => done)
  })

  it("lists the featured packages and themes", function () {
    const callback = jasmine.createSpy("callback")
    apm.run(["featured"], callback)

    waitsFor("waiting for command to complete", () => callback.callCount > 0)

    return runs(function () {
      expect(console.log).toHaveBeenCalled()
      expect(console.log.argsForCall[1][0]).toContain("beverly-hills")
      expect(console.log.argsForCall[2][0]).toContain("multi-version")
      return expect(console.log.argsForCall[3][0]).toContain("duckblur")
    })
  })

  return describe("when the theme flag is specified", () =>
    it("lists the featured themes", function () {
      const callback = jasmine.createSpy("callback")
      apm.run(["featured", "--themes"], callback)

      waitsFor("waiting for command to complete", () => callback.callCount > 0)

      return runs(function () {
        expect(console.log).toHaveBeenCalled()
        expect(console.log.argsForCall[1][0]).toContain("duckblur")
        return expect(console.log.argsForCall[2][0]).toBeUndefined()
      })
    }))
})
