let keytar
try {
  keytar = require("keytar")
} catch (error) {
  // Gracefully handle keytar failing to load due to missing library on Linux
  if (process.platform === "linux") {
    keytar = {
      findPassword() {
        return Promise.reject()
      },
      setPassword() {
        return Promise.reject()
      },
    }
  } else {
    throw error
  }
}

const tokenName = "Atom.io API Token"

// Get the Atom.io API token from the keychain.
//
// callback - A function to call with an error as the first argument and a
//            string token as the second argument.
var getToken = module.exports.getToken = function getToken(callback) {
  return keytar
    .findPassword(tokenName)
    .then(function (token) {
      if (token) {
        return callback(null, token)
      } else {
        return Promise.reject()
      }
    })
    .catch(function () {
      let token
      if ((token = process.env.ATOM_ACCESS_TOKEN)) {
        return callback(null, token)
      } else {
        return callback(`\
No Atom.io API token in keychain
Run \`apm login\` or set the \`ATOM_ACCESS_TOKEN\` environment variable.\
`)
      }
    })
}

// Save the given token to the keychain.
//
// token - A string token to save.
var saveToken = module.exports.saveToken = function saveToken(token) {
  return keytar.setPassword(tokenName, "atom.io", token)
}
