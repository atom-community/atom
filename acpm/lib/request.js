const npm = require("npm")
const request = require("request")
const config = require("./apm")

function loadNpm(callback) {
    const npmOptions = {
        userconfig: config.getUserConfigPath(),
        globalconfig: config.getGlobalConfigPath(),
    }
    return npm.load(npmOptions, callback)
}

function configureRequest(requestOptions, callback) {
    return loadNpm(function () {
        let left

        if (requestOptions.proxy == null) {
            requestOptions.proxy = npm.config.get("https-proxy") || npm.config.get("proxy") || process.env.HTTPS_PROXY || process.env.HTTP_PROXY
        }

        if (requestOptions.strictSSL == null) {
            requestOptions.strictSSL = npm.config.get("strict-ssl")
        }

        const userAgent = (left = npm.config.get("user-agent")) != null ? left : `AtomApm/${require("../package.json").version}`

        if (requestOptions.headers == null) {
            requestOptions.headers = {}
        }

        if (requestOptions.headers["User-Agent"] == null) {
            requestOptions.headers["User-Agent"] = userAgent
        }

        return callback()
    })
}

var get = (module.exports.get = function get(requestOptions, callback) {
    return configureRequest(requestOptions, function () {
        let retryCount = requestOptions.retries != null ? requestOptions.retries : 0
        let requestsMade = 0

        const tryRequest = function () {
            requestsMade++
            return request.get(requestOptions, function (error, response, body) {
                if (retryCount > 0 && ["ETIMEDOUT", "ECONNRESET"].includes(error === null || error === void 0 ? void 0 : error.code)) {
                    retryCount--
                    return tryRequest()
                } else {
                    if (error !== null && error !== void 0 && error.message && requestsMade > 1) {
                        error.message += ` (${requestsMade} attempts)`
                    }

                    return callback(error, response, body)
                }
            })
        }

        return tryRequest()
    })
})

var del = (module.exports.del = function del(requestOptions, callback) {
    return configureRequest(requestOptions, () => request.del(requestOptions, callback))
})

var post = (module.exports.post = function post(requestOptions, callback) {
    return configureRequest(requestOptions, () => request.post(requestOptions, callback))
})

var createReadStream = (module.exports.createReadStream = function createReadStream(requestOptions, callback) {
    return configureRequest(requestOptions, () => callback(request.get(requestOptions)))
})

var getErrorMessage = (module.exports.getErrorMessage = function getErrorMessage(response, body) {
    if ((response === null || response === void 0 ? void 0 : response.statusCode) === 503) {
        return "atom.io is temporarily unavailable, please try again later."
    } else {
        let left
        return (left = (body === null || body === void 0 ? void 0 : body.message) != null ? (body === null || body === void 0 ? void 0 : body.message) : body === null || body === void 0 ? void 0 : body.error) != null ? left : body
    }
})

var debug = (module.exports.debug = function debug(debug) {
    return (request.debug = debug)
})
