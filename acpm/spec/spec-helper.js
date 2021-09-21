const auth = require("../lib/auth")

global.spyOnConsole = function (callThrough = true) {
  spyOn(console, "log")
  spyOn(console, "error")
  spyOn(process.stdout, "write")
  spyOn(process.stderr, "write")

  if (callThrough) {
    return [console.log, console.error, process.stdout.write, process.stderr.write].map((spy) => spy.andCallThrough())
  }
}

global.spyOnToken = () => spyOn(auth, "getToken").andCallFake((callback) => callback(null, "token"))
