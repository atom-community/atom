const path = require("path")
const fs = require("fysh")
const http = require("http")
const temp = require("temp")
const express = require("express")
const CSON = require("season")
const apm = require("../lib/apm-cli")

describe("apm ci", function () {
  let [atomHome, resourcePath, server] = Array.from([])

  beforeEach(function () {
    spyOnToken()
    spyOnConsole()

    atomHome = temp.mkdirSync("apm-home-dir-")
    process.env.ATOM_HOME = atomHome

    resourcePath = temp.mkdirSync("atom-resource-path-")
    process.env.ATOM_RESOURCE_PATH = resourcePath

    delete process.env.npm_config_cache

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
    app.get("/test-module-with-dependencies", (request, response) =>
      response.sendFile(path.join(__dirname, "fixtures", "install-locked-version.json"))
    )
    app.get("/test-module", (request, response) =>
      response.sendFile(path.join(__dirname, "fixtures", "install-test-module.json"))
    )
    app.get("/native-module", (request, response) =>
      response.sendFile(path.join(__dirname, "fixtures", "native-module.json"))
    )
    app.get("/tarball/test-module-with-dependencies-1.1.0.tgz", (request, response) =>
      response.sendFile(path.join(__dirname, "fixtures", "test-module-with-dependencies-1.1.0.tgz"))
    )
    app.get("/tarball/test-module-1.1.0.tgz", (request, response) =>
      response.sendFile(path.join(__dirname, "fixtures", "test-module-1.1.0.tgz"))
    )
    app.get("/tarball/native-module-1.0.0.tgz", (request, response) =>
      response.sendFile(path.join(__dirname, "fixtures", "native-module-1.0.0.tgz"))
    )

    server = http.createServer(app)

    let live = false
    server.listen(3000, "127.0.0.1", function () {
      process.env.ATOM_ELECTRON_URL = "http://localhost:3000/node"
      process.env.ATOM_PACKAGES_URL = "http://localhost:3000/packages"
      process.env.ATOM_ELECTRON_VERSION = "v10.20.1"
      process.env.npm_config_registry = "http://localhost:3000/"
      return (live = true)
    })
    return waitsFor(() => live)
  })

  afterEach(function () {
    let done = false
    server.close(() => (done = true))
    return waitsFor(() => done)
  })

  it("installs dependency versions as specified by the lockfile", function () {
    const moduleDirectory = path.join(temp.mkdirSync("apm-test-"), "test-module-with-lockfile")
    fs.copySync(path.join(__dirname, "fixtures", "test-module-with-lockfile"), moduleDirectory)
    process.chdir(moduleDirectory)

    const callback = jasmine.createSpy("callback")
    apm.run(["ci"], callback)
    waitsFor("waiting for install to complete", 600000, () => callback.callCount > 0)

    return runs(function () {
      expect(callback.mostRecentCall.args[0]).toBeNull()

      const pjson0 = CSON.readFileSync(path.join("node_modules", "test-module-with-dependencies", "package.json"))
      expect(pjson0.version).toBe("1.1.0")

      const pjson1 = CSON.readFileSync(path.join("node_modules", "test-module", "package.json"))
      return expect(pjson1.version).toBe("1.1.0")
    })
  })

  it("builds a native dependency correctly", function () {
    const moduleDirectory = path.join(temp.mkdirSync("apm-test-"), "test-module-with-native")
    fs.copySync(path.join(__dirname, "fixtures", "test-module-with-lockfile"), moduleDirectory)
    process.chdir(moduleDirectory)

    const pjsonPath = path.join(moduleDirectory, "package.json")
    const pjson = CSON.readFileSync(pjsonPath)
    pjson.dependencies["native-module"] = "^1.0.0"
    CSON.writeFileSync(pjsonPath, pjson)

    const callback0 = jasmine.createSpy("callback")
    const callback1 = jasmine.createSpy("callback")

    apm.run(["install"], callback0)
    waitsFor("waiting for install to complete", 600000, () => callback0.callCount > 0)

    runs(function () {
      expect(callback0.mostRecentCall.args[0]).toBeNull()
      return apm.run(["ci"], callback1)
    })

    waitsFor("waiting for ci to complete", 600000, () => callback1.callCount > 0)

    return runs(function () {
      expect(callback1.mostRecentCall.args[0]).toBeNull()
      return expect(
        fs.existsSync(path.join(moduleDirectory, "node_modules", "native-module", "build", "Release", "native.node"))
      ).toBeTruthy()
    })
  })

  it("fails if the lockfile is not present", function () {
    const moduleDirectory = path.join(temp.mkdirSync("apm-test-"), "test-module")
    fs.copySync(path.join(__dirname, "fixtures", "test-module"), moduleDirectory)
    process.chdir(moduleDirectory)

    const callback = jasmine.createSpy("callback")
    apm.run(["ci"], callback)
    waitsFor("waiting for install to complete", 600000, () => callback.callCount > 0)

    return runs(() => expect(callback.mostRecentCall.args[0]).not.toBeNull())
  })

  return it("fails if the lockfile is out of date", function () {
    const moduleDirectory = path.join(temp.mkdirSync("apm-test-"), "test-module-with-lockfile")
    fs.copySync(path.join(__dirname, "fixtures", "test-module-with-lockfile"), moduleDirectory)
    process.chdir(moduleDirectory)

    const pjsonPath = path.join(moduleDirectory, "package.json")
    const pjson = CSON.readFileSync(pjsonPath)
    pjson.dependencies["test-module"] = "^1.2.0"
    CSON.writeFileSync(pjsonPath, pjson)

    const callback = jasmine.createSpy("callback")
    apm.run(["ci"], callback)
    waitsFor("waiting for install to complete", 600000, () => callback.callCount > 0)

    return runs(() => expect(callback.mostRecentCall.args[0]).not.toBeNull())
  })
})
