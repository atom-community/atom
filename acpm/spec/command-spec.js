const Command = require("../lib/command")

describe("Command", () =>
  describe("::spawn", () =>
    it("only calls the callback once if the spawned program fails", function () {
      let exited = false
      let callbackCount = 0

      const command = new Command()
      const child = command.spawn("thisisafakecommand", [], () => callbackCount++)
      child.once("close", () => (exited = true))

      waitsFor(() => exited)

      return runs(() => expect(callbackCount).toEqual(1))
    })))
