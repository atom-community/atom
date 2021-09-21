const run = require("./apm-cli").run

process.title = "apm"

run(process.argv.slice(2), (error) => (process.exitCode = error != null ? 1 : 0))
