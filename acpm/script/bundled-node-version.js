const child_process = require("child_process")

/**
 * get version
 *
 * @param {String} filename - path to the node binary
 * @return {Array} [versionString, archString]
 *
 * @example
 *     let [version, arch] = await bundledNodeVersion("/bin/node")
 */
module.exports = function (filename) {
    return new Promise((resolve, reject)=>{
        child_process.exec(`${filename} -v`, function (error, stdout) {
            if (error != null) {
                reject(error)
                return
            }

            let version = null
            if (stdout != null) {
                version = stdout.toString().trim()
            }

            child_process.exec(`${filename} -p 'process.arch'`, function (error, stdout) {
                let arch = null
                if (stdout != null) {
                    arch = stdout.toString().trim()
                }
                if (error != null) {
                    reject(error, version, arch)
                } else {
                    resolve([version, arch])
                }
            })
        })
    })
}
