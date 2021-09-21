const path = require("path")
const fs = require("fysh")
const temp = require("temp")
const express = require("express")
const http = require("http")
const apm = require("../lib/apm-cli")

describe("apm publish", function () {
  let [server] = Array.from([])

  beforeEach(function () {
    spyOnToken()
    spyOnConsole()

    const app = express()
    server = http.createServer(app)

    let live = false
    server.listen(3000, "127.0.0.1", function () {
      const atomHome = temp.mkdirSync("apm-home-dir-")
      process.env.ATOM_HOME = atomHome
      process.env.ATOM_API_URL = "http://localhost:3000/api"
      process.env.ATOM_RESOURCE_PATH = temp.mkdirSync("atom-resource-path-")
      return (live = true)
    })
    return waitsFor(() => live)
  })

  afterEach(function () {
    let done = false
    server.close(() => (done = true))
    return waitsFor(() => done)
  })

  it("validates the package's package.json file", function () {
    const packageToPublish = temp.mkdirSync("apm-test-package-")
    fs.writeFileSync(path.join(packageToPublish, "package.json"), "}{")
    process.chdir(packageToPublish)
    const callback = jasmine.createSpy("callback")
    apm.run(["publish"], callback)

    waitsFor("waiting for publish to complete", 600000, () => callback.callCount === 1)

    return runs(() =>
      expect(callback.mostRecentCall.args[0].message).toBe(
        "Error parsing package.json file: Unexpected token } in JSON at position 0"
      )
    )
  })

  it("validates the package is in a Git repository", function () {
    const packageToPublish = temp.mkdirSync("apm-test-package-")
    const metadata = {
      name: "test",
      version: "1.0.0",
    }
    fs.writeFileSync(path.join(packageToPublish, "package.json"), JSON.stringify(metadata))
    process.chdir(packageToPublish)
    const callback = jasmine.createSpy("callback")
    apm.run(["publish"], callback)

    waitsFor("waiting for publish to complete", 600000, () => callback.callCount === 1)

    return runs(() =>
      expect(callback.mostRecentCall.args[0].message).toBe(
        "Package must be in a Git repository before publishing: https://help.github.com/articles/create-a-repo"
      )
    )
  })

  it("validates the engines.atom range in the package.json file", function () {
    const packageToPublish = temp.mkdirSync("apm-test-package-")
    const metadata = {
      name: "test",
      version: "1.0.0",
      engines: {
        atom: "><>",
      },
    }
    fs.writeFileSync(path.join(packageToPublish, "package.json"), JSON.stringify(metadata))
    process.chdir(packageToPublish)
    const callback = jasmine.createSpy("callback")
    apm.run(["publish"], callback)

    waitsFor("waiting for publish to complete", 600000, () => callback.callCount === 1)

    return runs(() =>
      expect(callback.mostRecentCall.args[0].message).toBe(
        "The Atom engine range in the package.json file is invalid: ><>"
      )
    )
  })

  it("validates the dependency semver ranges in the package.json file", function () {
    const packageToPublish = temp.mkdirSync("apm-test-package-")
    const metadata = {
      name: "test",
      version: "1.0.0",
      engines: {
        atom: "1",
      },
      dependencies: {
        abc: "git://github.com/user/project.git",
        abcd: "latest",
        foo: "^^",
      },
    }
    fs.writeFileSync(path.join(packageToPublish, "package.json"), JSON.stringify(metadata))
    process.chdir(packageToPublish)
    const callback = jasmine.createSpy("callback")
    apm.run(["publish"], callback)

    waitsFor("waiting for publish to complete", 600000, () => callback.callCount === 1)

    return runs(() =>
      expect(callback.mostRecentCall.args[0].message).toBe(
        "The foo dependency range in the package.json file is invalid: ^^"
      )
    )
  })

  return it("validates the dev dependency semver ranges in the package.json file", function () {
    const packageToPublish = temp.mkdirSync("apm-test-package-")
    const metadata = {
      name: "test",
      version: "1.0.0",
      engines: {
        atom: "1",
      },
      dependencies: {
        foo: "^5",
      },
      devDependencies: {
        abc: "git://github.com/user/project.git",
        abcd: "latest",
        bar: "1,3",
      },
    }
    fs.writeFileSync(path.join(packageToPublish, "package.json"), JSON.stringify(metadata))
    process.chdir(packageToPublish)
    const callback = jasmine.createSpy("callback")
    apm.run(["publish"], callback)

    waitsFor("waiting for publish to complete", 600000, () => callback.callCount === 1)

    return runs(() =>
      expect(callback.mostRecentCall.args[0].message).toBe(
        "The bar dev dependency range in the package.json file is invalid: 1,3"
      )
    )
  })
})
