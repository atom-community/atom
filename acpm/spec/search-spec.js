const path = require("path")
const express = require("express")
const http = require("http")
const apm = require("../lib/apm-cli")

describe("apm search", function () {
  let server = null

  beforeEach(function () {
    spyOnConsole()
    spyOnToken()

    const app = express()
    app.get("/search", (request, response) => response.sendFile(path.join(__dirname, "fixtures", "search.json")))
    server = http.createServer(app)

    let live = false
    server.listen(3000, "127.0.0.1", function () {
      process.env.ATOM_PACKAGES_URL = "http://localhost:3000"
      return (live = true)
    })
    return waitsFor(() => live)
  })

  afterEach(function () {
    let done = false
    server.close(() => (done = true))
    return waitsFor(() => done)
  })

  it("lists the matching packages and excludes deprecated packages", function () {
    const callback = jasmine.createSpy("callback")
    apm.run(["search", "duck"], callback)

    waitsFor("waiting for command to complete", () => callback.callCount > 0)

    return runs(function () {
      expect(console.log).toHaveBeenCalled()
      expect(console.log.argsForCall[1][0]).toContain("duckberg")
      expect(console.log.argsForCall[2][0]).toContain("ducktales")
      expect(console.log.argsForCall[3][0]).toContain("duckblur")
      return expect(console.log.argsForCall[4][0]).toBeUndefined()
    })
  })

  return it("logs an error if the query is missing or empty", function () {
    const callback = jasmine.createSpy("callback")
    apm.run(["search"], callback)

    waitsFor("waiting for command to complete", () => callback.callCount > 0)

    return runs(function () {
      expect(console.error).toHaveBeenCalled()
      return expect(console.error.argsForCall[0][0].length).toBeGreaterThan(0)
    })
  })
})
