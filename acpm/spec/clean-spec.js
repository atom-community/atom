const path = require("path")
const fs = require("fysh")
const temp = require("temp")
const express = require("express")
const http = require("http")
const apm = require("../lib/apm-cli")

describe("apm clean", function () {
  let [moduleDirectory, server] = Array.from([])

  beforeEach(function () {
    spyOnConsole()
    spyOnToken()

    const app = express()

    app.get("/node/v10.20.1/node-v10.20.1.tar.gz", (request, response) =>
      response.sendFile(path.join(__dirname, "fixtures", "node-v10.20.1.tar.gz"))
    )
    app.get("/node/v10.20.1/node-v10.20.1-headers.tar.gz", (request, response) =>
      response.sendFile(path.join(__dirname, "fixtures", "node-v10.20.1-headers.tar.gz"))
    )
    app.get("/node/v10.20.1/node.lib", (request, response) =>
      response.sendFile(path.join(__dirname, "fixtures", "node.lib"))
    )
    app.get("/node/v10.20.1/x64/node.lib", (request, response) =>
      response.sendFile(path.join(__dirname, "fixtures", "node_x64.lib"))
    )
    app.get("/node/v10.20.1/SHASUMS256.txt", (request, response) =>
      response.sendFile(path.join(__dirname, "fixtures", "SHASUMS256.txt"))
    )
    app.get("/test-module", (request, response) =>
      response.sendFile(path.join(__dirname, "fixtures", "install-test-module.json"))
    )
    app.get("/tarball/test-module-1.2.0.tgz", (request, response) =>
      response.sendFile(path.join(__dirname, "fixtures", "test-module-1.2.0.tgz"))
    )

    server = http.createServer(app)

    let live = false
    server.listen(3000, "127.0.0.1", function () {
      console.log("Server started")
      const atomHome = temp.mkdirSync("apm-home-dir-")
      process.env.ATOM_HOME = atomHome
      process.env.ATOM_ELECTRON_URL = "http://localhost:3000/node"
      process.env.ATOM_ELECTRON_VERSION = "v10.20.1"
      process.env.npm_config_registry = "http://localhost:3000/"

      moduleDirectory = path.join(temp.mkdirSync("apm-test-module-"), "test-module-with-dependencies")
      fs.copySync(path.join(__dirname, "fixtures", "test-module-with-dependencies"), moduleDirectory)
      process.chdir(moduleDirectory)
      return (live = true)
    })
    return waitsFor(() => live)
  })

  afterEach(function () {
    let done = false
    server.close(() => (done = true))
    return waitsFor(() => done)
  })

  it("uninstalls any packages not referenced in the package.json", function () {
    const removedPath = path.join(moduleDirectory, "node_modules", "will-be-removed")
    fs.makeTreeSync(removedPath)
    fs.writeFileSync(
      path.join(removedPath, "package.json"),
      '{"name": "will-be-removed", "version": "1.0.0", "dependencies": {}}',
      "utf8"
    )

    const callback = jasmine.createSpy("callback")
    apm.run(["clean"], callback)

    waitsFor("waiting for command to complete", () => callback.callCount > 0)

    return runs(function () {
      expect(callback.mostRecentCall.args[0]).toBeUndefined()
      return expect(fs.existsSync(removedPath)).toBeFalsy()
    })
  })

  return it("uninstalls a scoped package", function () {
    const removedPath = path.join(moduleDirectory, "node_modules/@types/atom")
    fs.makeTreeSync(removedPath)
    fs.writeFileSync(
      path.join(removedPath, "package.json"),
      '{"name": "@types/atom", "version": "1.0.0", "dependencies": {}}',
      "utf8"
    )

    const callback = jasmine.createSpy("callback")
    apm.run(["clean"], callback)

    waitsFor("waiting for command to complete", () => callback.callCount > 0)

    return runs(function () {
      expect(callback.mostRecentCall.args[0]).toBeUndefined()
      return expect(fs.existsSync(removedPath)).toBeFalsy()
    })
  })
})
