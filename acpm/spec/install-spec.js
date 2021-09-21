const path = require("path")
const CSON = require("season")
const temp = require("temp")
const express = require("express")
const http = require("http")
const fs = require("fysh")
const apm = require("../lib/apm-cli")
const Install = require("../lib/install")

describe("apm install", function () {
  let [atomHome, resourcePath] = Array.from([])

  beforeEach(function () {
    spyOnToken()

    atomHome = temp.mkdirSync("apm-home-dir-")
    process.env.ATOM_HOME = atomHome

    // Make sure the cache used is the one for the test env
    delete process.env.npm_config_cache

    resourcePath = temp.mkdirSync("atom-resource-path-")
    return (process.env.ATOM_RESOURCE_PATH = resourcePath)
  })

  return describe("when installing an atom package", function () {
    let server = null

    beforeEach(function () {
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
      app.get("/tarball/test-module-1.1.0.tgz", (request, response) =>
        response.sendFile(path.join(__dirname, "fixtures", "test-module-1.1.0.tgz"))
      )
      app.get("/tarball/test-module-1.2.0.tgz", (request, response) =>
        response.sendFile(path.join(__dirname, "fixtures", "test-module-1.2.0.tgz"))
      )
      app.get("/tarball/test-module2-2.0.0.tgz", (request, response) =>
        response.sendFile(path.join(__dirname, "fixtures", "test-module2-2.0.0.tgz"))
      )
      app.get("/packages/test-module", (request, response) =>
        response.sendFile(path.join(__dirname, "fixtures", "install-test-module.json"))
      )
      app.get("/packages/test-module2", (request, response) =>
        response.sendFile(path.join(__dirname, "fixtures", "install-test-module2.json"))
      )
      app.get("/packages/test-rename", (request, response) => response.redirect(302, "/packages/test-module"))
      app.get("/packages/test-module-with-bin", (request, response) =>
        response.sendFile(path.join(__dirname, "fixtures", "install-test-module-with-bin.json"))
      )
      app.get("/packages/test-module-with-symlink", (request, response) =>
        response.sendFile(path.join(__dirname, "fixtures", "install-test-module-with-symlink.json"))
      )
      app.get("/tarball/test-module-with-symlink-5.0.0.tgz", (request, response) =>
        response.sendFile(path.join(__dirname, "fixtures", "test-module-with-symlink-5.0.0.tgz"))
      )
      app.get("/tarball/test-module-with-bin-2.0.0.tgz", (request, response) =>
        response.sendFile(path.join(__dirname, "fixtures", "test-module-with-bin-2.0.0.tgz"))
      )
      app.get("/packages/multi-module", (request, response) =>
        response.sendFile(path.join(__dirname, "fixtures", "install-multi-version.json"))
      )
      app.get("/packages/atom-2048", (request, response) =>
        response.sendFile(path.join(__dirname, "fixtures", "atom-2048.json"))
      )
      app.get("/packages/native-package", (request, response) =>
        response.sendFile(path.join(__dirname, "fixtures", "native-package.json"))
      )
      app.get("/tarball/native-package-1.0.0.tgz", (request, response) =>
        response.sendFile(path.join(__dirname, "fixtures", "native-package-1.0.0.tar.gz"))
      )

      server = http.createServer(app)

      let live = false
      server.listen(3000, "127.0.0.1", function () {
        atomHome = temp.mkdirSync("apm-home-dir-")
        process.env.ATOM_HOME = atomHome
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

    describe("when an invalid URL is specified", () =>
      it("logs an error and exits", function () {
        const callback = jasmine.createSpy("callback")

        spyOnConsole()

        apm.run(["install", "not-a-module"], callback)

        waitsFor("waiting for install to complete", 600000, () => callback.callCount === 1)

        return runs(function () {
          expect(console.error.mostRecentCall.args[0].length).toBeGreaterThan(0)
          return expect(callback.mostRecentCall.args[0]).not.toBeUndefined()
        })
      }))

    describe("when a package name is specified", function () {
      it("installs the package", function () {
        const testModuleDirectory = path.join(atomHome, "packages", "test-module")
        fs.makeTreeSync(testModuleDirectory)
        const existingTestModuleFile = path.join(testModuleDirectory, "will-be-deleted.js")
        fs.writeFileSync(existingTestModuleFile, "")
        expect(fs.existsSync(existingTestModuleFile)).toBeTruthy()

        const callback = jasmine.createSpy("callback")
        apm.run(["install", "test-module"], callback)

        waitsFor("waiting for install to complete", 600000, () => callback.callCount === 1)

        return runs(function () {
          expect(fs.existsSync(existingTestModuleFile)).toBeFalsy()
          expect(fs.existsSync(path.join(testModuleDirectory, "index.js"))).toBeTruthy()
          expect(fs.existsSync(path.join(testModuleDirectory, "package.json"))).toBeTruthy()
          return expect(callback.mostRecentCall.args[0]).toBeNull()
        })
      })

      return describe("when multiple releases are available", function () {
        it("installs the latest compatible version", function () {
          CSON.writeFileSync(path.join(resourcePath, "package.json"), { version: "1.5.0" })
          const packageDirectory = path.join(atomHome, "packages", "test-module")

          const callback = jasmine.createSpy("callback")
          apm.run(["install", "multi-module"], callback)

          waitsFor("waiting for install to complete", 600000, () => callback.callCount === 1)

          return runs(function () {
            expect(JSON.parse(fs.readFileSync(path.join(packageDirectory, "package.json"))).version).toBe("1.1.0")
            return expect(callback.mostRecentCall.args[0]).toBeNull()
          })
        })

        it("ignores the commit SHA suffix in the version", function () {
          CSON.writeFileSync(path.join(resourcePath, "package.json"), { version: "1.5.0-deadbeef" })
          const packageDirectory = path.join(atomHome, "packages", "test-module")

          const callback = jasmine.createSpy("callback")
          apm.run(["install", "multi-module"], callback)

          waitsFor("waiting for install to complete", 600000, () => callback.callCount === 1)

          return runs(function () {
            expect(JSON.parse(fs.readFileSync(path.join(packageDirectory, "package.json"))).version).toBe("1.1.0")
            return expect(callback.mostRecentCall.args[0]).toBeNull()
          })
        })

        it("logs an error when no compatible versions are available", function () {
          CSON.writeFileSync(path.join(resourcePath, "package.json"), { version: "0.9.0" })
          const packageDirectory = path.join(atomHome, "packages", "test-module")

          const callback = jasmine.createSpy("callback")
          apm.run(["install", "multi-module"], callback)

          waitsFor("waiting for install to complete", 600000, () => callback.callCount === 1)

          return runs(function () {
            expect(fs.existsSync(packageDirectory)).toBeFalsy()
            return expect(callback.mostRecentCall.args[0]).not.toBeNull()
          })
        })

        return describe("when the package has been renamed", () =>
          it("installs the package with the new name and removes the old package", function () {
            const testRenameDirectory = path.join(atomHome, "packages", "test-rename")
            const testModuleDirectory = path.join(atomHome, "packages", "test-module")
            fs.makeTreeSync(testRenameDirectory)
            expect(fs.existsSync(testRenameDirectory)).toBeTruthy()
            expect(fs.existsSync(testModuleDirectory)).toBeFalsy()

            const callback = jasmine.createSpy("callback")
            apm.run(["install", "test-rename"], callback)

            waitsFor("waiting for install to complete", 600000, () => callback.callCount === 1)

            return runs(function () {
              expect(fs.existsSync(testRenameDirectory)).toBeFalsy()
              expect(fs.existsSync(testModuleDirectory)).toBeTruthy()
              expect(fs.existsSync(path.join(testModuleDirectory, "index.js"))).toBeTruthy()
              expect(fs.existsSync(path.join(testModuleDirectory, "package.json"))).toBeTruthy()
              return expect(callback.mostRecentCall.args[0]).toBeNull()
            })
          }))
      })
    })

    describe("when multiple package names are specified", function () {
      it("installs all packages", function () {
        const testModuleDirectory = path.join(atomHome, "packages", "test-module")
        const testModule2Directory = path.join(atomHome, "packages", "test-module2")

        const callback = jasmine.createSpy("callback")
        apm.run(["install", "test-module", "test-module2", "test-module"], callback)

        waitsFor("waiting for install to complete", 600000, () => callback.callCount === 1)

        return runs(function () {
          expect(fs.existsSync(path.join(testModuleDirectory, "index.js"))).toBeTruthy()
          expect(fs.existsSync(path.join(testModuleDirectory, "package.json"))).toBeTruthy()
          expect(fs.existsSync(path.join(testModule2Directory, "index2.js"))).toBeTruthy()
          expect(fs.existsSync(path.join(testModule2Directory, "package.json"))).toBeTruthy()
          return expect(callback.mostRecentCall.args[0]).toBeNull()
        })
      })

      return it("installs them in order and stops on the first failure", function () {
        const testModuleDirectory = path.join(atomHome, "packages", "test-module")
        const testModule2Directory = path.join(atomHome, "packages", "test-module2")

        const callback = jasmine.createSpy("callback")
        apm.run(["install", "test-module", "test-module-bad", "test-module2"], callback)

        waitsFor("waiting for install to complete", 600000, () => callback.callCount === 1)

        return runs(function () {
          expect(fs.existsSync(path.join(testModuleDirectory, "index.js"))).toBeTruthy()
          expect(fs.existsSync(path.join(testModuleDirectory, "package.json"))).toBeTruthy()
          expect(fs.existsSync(path.join(testModule2Directory, "index2.js"))).toBeFalsy()
          expect(fs.existsSync(path.join(testModule2Directory, "package.json"))).toBeFalsy()
          return expect(callback.mostRecentCall.args[0]).not.toBeUndefined()
        })
      })
    })

    describe("when no path is specified", () =>
      it("installs all dependent modules", function () {
        const moduleDirectory = path.join(temp.mkdirSync("apm-test-module-"), "test-module-with-dependencies")
        fs.copySync(path.join(__dirname, "fixtures", "test-module-with-dependencies"), moduleDirectory)
        process.chdir(moduleDirectory)
        const callback = jasmine.createSpy("callback")
        apm.run(["install"], callback)

        waitsFor("waiting for install to complete", 600000, () => callback.callCount > 0)

        return runs(function () {
          expect(fs.existsSync(path.join(moduleDirectory, "node_modules", "test-module", "index.js"))).toBeTruthy()
          expect(fs.existsSync(path.join(moduleDirectory, "node_modules", "test-module", "package.json"))).toBeTruthy()
          return expect(callback.mostRecentCall.args[0]).toEqual(null)
        })
      }))

    describe("when the packages directory does not exist", () =>
      it("creates the packages directory and any intermediate directories that do not exist", function () {
        atomHome = temp.path("apm-home-dir-")
        process.env.ATOM_HOME = atomHome
        expect(fs.existsSync(atomHome)).toBe(false)

        const callback = jasmine.createSpy("callback")
        apm.run(["install", "test-module"], callback)

        waitsFor("waiting for install to complete", 600000, () => callback.callCount === 1)

        return runs(() => expect(fs.existsSync(atomHome)).toBe(true))
      }))

    describe("when the package contains symlinks", () =>
      it("copies them correctly from the temp directory", function () {
        const testModuleDirectory = path.join(atomHome, "packages", "test-module-with-symlink")

        const callback = jasmine.createSpy("callback")
        apm.run(["install", "test-module-with-symlink"], callback)

        waitsFor("waiting for install to complete", 600000, () => callback.callCount === 1)

        return runs(function () {
          expect(fs.isFileSync(path.join(testModuleDirectory, "index.js"))).toBeTruthy()

          if (process.platform === "win32") {
            return expect(fs.isFileSync(path.join(testModuleDirectory, "node_modules", ".bin", "abin"))).toBeTruthy()
          } else {
            return expect(fs.realpathSync(path.join(testModuleDirectory, "node_modules", ".bin", "abin"))).toBe(
              fs.realpathSync(path.join(testModuleDirectory, "node_modules", "test-module-with-bin", "bin", "abin.js"))
            )
          }
        })
      }))

    describe("when the package installs binaries", () =>
      // regression: caused by the existence of `.bin` in the install folder
      it("correctly installs the package ignoring any binaries", function () {
        const testModuleDirectory = path.join(atomHome, "packages", "test-module-with-bin")

        const callback = jasmine.createSpy("callback")
        apm.run(["install", "test-module-with-bin"], callback)

        waitsFor("waiting for install to complete", 60000, () => callback.callCount === 1)

        return runs(function () {
          expect(callback.argsForCall[0][0]).toBeFalsy()
          return expect(fs.isFileSync(path.join(testModuleDirectory, "package.json"))).toBeTruthy()
        })
      }))

    describe("when a packages file is specified", function () {
      it("installs all the packages listed in the file", function () {
        const testModuleDirectory = path.join(atomHome, "packages", "test-module")
        const testModule2Directory = path.join(atomHome, "packages", "test-module2")
        const packagesFilePath = path.join(__dirname, "fixtures", "packages.txt")

        const callback = jasmine.createSpy("callback")
        apm.run(["install", "--packages-file", packagesFilePath], callback)

        waitsFor("waiting for install to complete", 600000, () => callback.callCount === 1)

        return runs(function () {
          expect(fs.existsSync(path.join(testModuleDirectory, "index.js"))).toBeTruthy()
          expect(fs.existsSync(path.join(testModuleDirectory, "package.json"))).toBeTruthy()
          expect(fs.existsSync(path.join(testModule2Directory, "index2.js"))).toBeTruthy()
          expect(fs.existsSync(path.join(testModule2Directory, "package.json"))).toBeTruthy()
          return expect(callback.mostRecentCall.args[0]).toBeNull()
        })
      })

      return it("calls back with an error when the file does not exist", function () {
        const badFilePath = path.join(__dirname, "fixtures", "not-packages.txt")

        const callback = jasmine.createSpy("callback")
        apm.run(["install", "--packages-file", badFilePath], callback)

        waitsFor("waiting for install to complete", 600000, () => callback.callCount === 1)

        return runs(() => expect(callback.mostRecentCall.args[0]).not.toBeNull())
      })
    })

    describe("when the package is bundled with Atom", function () {
      it("installs from a repo-local package path", function () {
        const atomRepoPath = temp.mkdirSync("apm-repo-dir-")
        CSON.writeFileSync(path.join(atomRepoPath, "package.json"), {
          packageDependencies: { "test-module-with-dependencies": "file:./packages/test-module-with-dependencies" },
        })
        const packageDirectory = path.join(atomRepoPath, "packages", "test-module-with-dependencies")
        fs.makeTreeSync(path.join(atomRepoPath, "packages"))
        fs.copySync(path.join(__dirname, "fixtures", "test-module-with-dependencies"), packageDirectory)
        const originalPath = process.cwd()
        process.chdir(atomRepoPath)

        const callback = jasmine.createSpy("callback")
        apm.run(["install"], callback)

        waitsFor("waiting for install to complete", 600000, () => callback.callCount > 0)

        return runs(function () {
          process.chdir(originalPath)
          expect(
            fs.existsSync(path.join(atomRepoPath, "node_modules", "test-module-with-dependencies", "package.json"))
          ).toBeTruthy()
          expect(fs.existsSync(path.join(atomRepoPath, "node_modules", "test-module", "package.json"))).toBeTruthy()
          return expect(callback.mostRecentCall.args[0]).toEqual(null)
        })
      })

      return it("logs a message to standard error", function () {
        CSON.writeFileSync(path.join(resourcePath, "package.json"), { packageDependencies: { "test-module": "1.0" } })

        const callback = jasmine.createSpy("callback")

        spyOnConsole()

        apm.run(["install", "test-module"], callback)

        waitsFor("waiting for install to complete", 600000, () => callback.callCount === 1)

        return runs(() => expect(console.error.mostRecentCall.args[0].length).toBeGreaterThan(0))
      })
    })

    describe("when --check is specified", () =>
      it("compiles a sample native module", function () {
        const callback = jasmine.createSpy("callback")
        apm.run(["install", "--check"], callback)

        waitsFor("waiting for install to complete", 600000, () => callback.callCount === 1)

        return runs(() => expect(callback.mostRecentCall.args[0]).toBeUndefined())
      }))

    describe("when a deprecated package name is specified", () =>
      it("does not install the package", function () {
        const callback = jasmine.createSpy("callback")
        apm.run(["install", "atom-2048"], callback)

        waitsFor("waiting for install to complete", 600000, () => callback.callCount === 1)

        return runs(() => expect(callback.mostRecentCall.args[0]).toBeTruthy())
      }))

    describe("::getNormalizedGitUrls", function () {
      it("normalizes https:// urls", function () {
        const url = "https://github.com/user/repo.git"
        const urls = new Install().getNormalizedGitUrls(url)
        return expect(urls).toEqual([url])
      })

      it("normalizes git@ urls", function () {
        const url = "git@github.com:user/repo.git"
        const urls = new Install().getNormalizedGitUrls(url)
        return expect(urls).toEqual(["git+ssh://git@github.com/user/repo.git"])
      })

      it("normalizes file:// urls", function () {
        const url = "file:///path/to/folder"
        const urls = new Install().getNormalizedGitUrls(url)
        return expect(urls).toEqual([url])
      })

      return it("normalizes user/repo shortcuts into both HTTPS and SSH URLs", function () {
        const url = "user/repo"
        const urls = new Install().getNormalizedGitUrls(url)
        return expect(urls).toEqual(["https://github.com/user/repo.git", "git+ssh://git@github.com/user/repo.git"])
      })
    })

    describe("::cloneFirstValidGitUrl", () =>
      describe("when cloning a URL fails", function () {
        let install = null
        const urls = ["url1", "url2", "url3", "url4"]

        beforeEach(function () {
          install = new Install()

          const fakeCloneRepository = function (url, ...args) {
            const callback = args[args.length - 1]
            if (url !== urls[2]) {
              return callback(new Error("Failed to clone"))
            }
          }

          return spyOn(install, "cloneNormalizedUrl").andCallFake(fakeCloneRepository)
        })

        return it("tries cloning the next URL until one works", function () {
          install.cloneFirstValidGitUrl(urls, {}, function () {})
          expect(install.cloneNormalizedUrl.calls.length).toBe(3)
          expect(install.cloneNormalizedUrl.argsForCall[0][0]).toBe(urls[0])
          expect(install.cloneNormalizedUrl.argsForCall[1][0]).toBe(urls[1])
          return expect(install.cloneNormalizedUrl.argsForCall[2][0]).toBe(urls[2])
        })
      }))

    describe("::getPackageDependencies", function () {
      let originalPath = null
      let packageDependencies = null
      const packageJsonContents = {
        dependencies: {
          "duplicate-package": "file:packages/duplicate-module",
          "different-package": "file:packages/different-package",
          "versioned-package": "https://url/to/versioned-package.tgz",
        },
        packageDependencies: {
          "duplicate-package": "file:./packages/duplicate-module",
          "different-package": "file:packages/im-batman",
          "missing-package": "file:./packages/missing-package",
          "versioned-package": "1.2.3",
        },
      }

      beforeEach(function () {
        const atomRepoPath = temp.mkdirSync("apm-repo-dir-")
        CSON.writeFileSync(path.join(atomRepoPath, "package.json"), packageJsonContents)
        originalPath = process.cwd()
        process.chdir(atomRepoPath)
        const install = new Install()
        return (packageDependencies = install.getPackageDependencies())
      })

      it("excludes repo-local packages in 'packageDependencies' which have an equivalent normalized path to that in 'dependencies'", () =>
        expect(packageDependencies["duplicate-package"]).toBe(undefined))

      it("includes repo-local packages in 'packageDependencies' which have different normalized path to that in 'dependencies'", () =>
        expect(packageDependencies["different-package"]).toBe("file:packages/im-batman"))

      it("includes repo-local packages in 'packageDependencies' that aren't in 'dependencies'", () =>
        expect(packageDependencies["missing-package"]).toBe("file:./packages/missing-package"))

      it("includes versioned packages in 'packageDependencies'", () =>
        expect(packageDependencies["versioned-package"]).toBe("1.2.3"))

      return afterEach(() => process.chdir(originalPath))
    })

    describe("when installing a package from a git repository", function () {
      let cloneUrl
      let pkgJsonPath

      beforeEach(function () {
        let count = 0
        const gitRepo = path.join(__dirname, "fixtures", "test-git-repo.git")
        cloneUrl = `file://${gitRepo}`

        apm.run(["install", cloneUrl], () => count++)

        waitsFor(10000, () => count === 1)

        return runs(() => (pkgJsonPath = path.join(process.env.ATOM_HOME, "packages", "test-git-repo", "package.json")))
      })

      it("installs the repository with a working dir to $ATOM_HOME/packages", () =>
        expect(fs.existsSync(pkgJsonPath)).toBeTruthy())

      it("adds apmInstallSource to the package.json with the source and sha", function () {
        const sha = "8ae432341ac6708aff9bb619eb015da14e9d0c0f"
        const json = require(pkgJsonPath)
        return expect(json.apmInstallSource).toEqual({
          type: "git",
          source: cloneUrl,
          sha,
        })
      })

      return it("installs dependencies and devDependencies", function () {
        const json = require(pkgJsonPath)
        const deps = Object.keys(json.dependencies)
        const devDeps = Object.keys(json.devDependencies)
        const allDeps = deps.concat(devDeps)
        expect(allDeps).toEqual(["tiny-node-module-one", "tiny-node-module-two"])
        return allDeps.forEach(function (dep) {
          const modPath = path.join(process.env.ATOM_HOME, "packages", "test-git-repo", "node_modules", dep)
          return expect(fs.existsSync(modPath)).toBeTruthy()
        })
      })
    })

    describe("when installing a Git URL and --json is specified", function () {
      let cloneUrl
      let pkgJsonPath

      beforeEach(function () {
        const callback = jasmine.createSpy("callback")
        const gitRepo = path.join(__dirname, "fixtures", "test-git-repo.git")
        cloneUrl = `file://${gitRepo}`

        spyOnConsole(false)

        apm.run(["install", cloneUrl, "--json"], callback)

        waitsFor(10000, () => callback.callCount === 1)

        return runs(() => (pkgJsonPath = path.join(process.env.ATOM_HOME, "packages", "test-git-repo", "package.json")))
      })

      return it("logs the installation path and the package metadata for a package installed via git url", function () {
        const sha = "8ae432341ac6708aff9bb619eb015da14e9d0c0f"
        expect(process.stdout.write.calls.length).toBe(0)
        const json = JSON.parse(console.log.argsForCall[0][0])
        expect(json.length).toBe(1)
        expect(json[0].installPath).toBe(path.join(process.env.ATOM_HOME, "packages", "test-git-repo"))
        expect(json[0].metadata.name).toBe("test-git-repo")
        return expect(json[0].metadata.apmInstallSource).toEqual({
          type: "git",
          source: cloneUrl,
          sha,
        })
      })
    })

    describe("when installing a registred package and --json is specified", function () {
      beforeEach(function () {
        const callback = jasmine.createSpy("callback")

        spyOnConsole(false)

        apm.run(["install", "test-module", "test-module2", "--json"], callback)

        return waitsFor("waiting for install to complete", 600000, () => callback.callCount === 1)
      })

      return it("logs the installation path and the package metadata for a registered package", function () {
        expect(process.stdout.write.calls.length).toBe(0)
        const json = JSON.parse(console.log.argsForCall[0][0])
        expect(json.length).toBe(2)
        expect(json[0].installPath).toBe(path.join(process.env.ATOM_HOME, "packages", "test-module"))
        expect(json[0].metadata.name).toBe("test-module")
        expect(json[1].installPath).toBe(path.join(process.env.ATOM_HOME, "packages", "test-module2"))
        return expect(json[1].metadata.name).toBe("test-module2")
      })
    })

    return describe("with a space in node-gyp's path", function () {
      const nodeModules = fs.realpathSync(path.join(__dirname, "..", "node_modules"))

      beforeEach(function () {
        // Normally npm_config_node_gyp would be ignored, but it works here because we're calling apm
        // directly and not through the scripts in bin/
        const nodeGypPath = path.dirname(path.dirname(require.resolve("node-gyp"))) // find an installed node-gyp
        fs.copySync(nodeGypPath, path.join(nodeModules, "with a space"))
        process.env.npm_config_node_gyp = path.join(nodeModules, "with a space", "bin", "node-gyp.js")

        // Read + execute permission
        return fs.chmodSync(process.env.npm_config_node_gyp, fs.constants.S_IRUSR | fs.constants.S_IXUSR)
      })

      afterEach(function () {
        delete process.env.npm_config_node_gyp
        return fs.removeSync(path.join(nodeModules, "with a space"))
      })

      return it("builds native code successfully", function () {
        const callback = jasmine.createSpy("callback")
        apm.run(["install", "native-package"], callback)

        waitsFor("waiting for install to complete", 600000, () => callback.callCount === 1)

        return runs(function () {
          expect(callback.mostRecentCall.args[0]).toBeNull()

          const testModuleDirectory = path.join(atomHome, "packages", "native-package")
          expect(fs.existsSync(path.join(testModuleDirectory, "index.js"))).toBeTruthy()
          expect(fs.existsSync(path.join(testModuleDirectory, "package.json"))).toBeTruthy()
          expect(fs.existsSync(path.join(testModuleDirectory, "build", "Release", "native.node"))).toBeTruthy()

          // TODO: Find a way to make this cross-platform (config.gypi, perhaps?)
          if (process.platform !== "win32") {
            const makefileContent = fs.readFileSync(path.join(testModuleDirectory, "build", "Makefile"), {
              encoding: "utf-8",
            })
            return expect(makefileContent).toMatch("node_modules/with\\ a\\ space/addon.gypi")
          }
        })
      })
    })
  })
})
