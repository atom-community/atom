const fs = require('fysh')
const path = require('path')
const zlib = require("zlib")

const tar = require("tar")
const temp = require("temp")

const request = require("request")
const getInstallNodeVersion = require("./bundled-node-version")

temp.track()

const identifyArch = function () {
  switch (process.arch) {
    case "ia32":
      return "x86"
    case "arm":
      return `armv${process.config.variables.arm_version}l`
    default:
      return process.arch
  }
}

const downloadFileToLocation = function (url, filename) {
    return new Promise((resolve, reject)=>{
        const stream = fs.createWriteStream(filename)
        stream.on("end", resolve)
        stream.on("error", reject)
        const requestStream = request.get(url)
        requestStream.on("response", function (response) {
            if (response.statusCode == 404) {
            console.error("download not found:", url)
            process.exit(1)
            }
            requestStream.pipe(stream)
        })
    })
}

const downloadTarballAndExtract = function (url, location) {
    return new Promise((resolve, reject)=>{
        const tempPath = temp.mkdirSync("apm-node-")
        const stream = tar.extract({
            cwd: tempPath,
        })
        stream.on("end", function () {
            resolve(tempPath)
        })
        stream.on("error", reject)
        const requestStream = request.get(url)
        requestStream.on("response", function (response) {
            if (response.statusCode == 404) {
                console.error("download not found:", url)
                process.exit(1)
            }
            requestStream.pipe(zlib.createGunzip()).pipe(stream)
        })
    })
}

const copyNodeBinToLocation = function (version, targetFilename, fromDirectory) {
    const arch = identifyArch()
    const subDir = `node-${version}-${process.platform}-${arch}`
    const downloadedNodePath = path.join(fromDirectory, subDir, "bin", "node")
    fs.mkdirSync(path.dirname(targetFilename), { recursive: true })
    fs.moveSync(downloadedNodePath, targetFilename, { overwrite: true })
    fs.chmodSync(targetFilename, "755")
}

const downloadNodeIfNeeded = async function (version, ) {
    try {
        const arch = identifyArch()
        const filename = path.join(__dirname, "..", "bin", process.platform === "win32" ? "node.exe" : "node")

        const downloadFile = async function () {
            if (process.platform === "win32") {
                return downloadFileToLocation(`https://nodejs.org/dist/${version}/win-${arch}/node.exe`, filename)
            } else {
                const tempPath = await downloadTarballAndExtract(
                    `https://nodejs.org/dist/${version}/node-${version}-${process.platform}-${arch}.tar.gz`,
                    filename,
                )
                copyNodeBinToLocation(version, filename, tempPath)
            }
        }
        if (fs.existsSync(filename)) {
            try {
                var [installedVersion, installedArch] = await getInstallNodeVersion(filename)
            } catch (error) {
                console.warn("Warning: issues when checking node version", error)
            }
            if (installedVersion !== version || installedArch !== process.arch) {
                await downloadFile()
            }
        } else {
            console.log(`downloading`)
            await downloadFile()
        }
    } catch (error) {
        console.error("Failed to download node", error)
        return process.exit(1)
    }
    return process.exit(0)
}

const versionToInstall = fs.readFileSync(path.resolve(__dirname, "..", ".npmrc"), "utf8").match(/target=(.*)\n/)[1]
downloadNodeIfNeeded(versionToInstall)
