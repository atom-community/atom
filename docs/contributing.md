# How Can I Propose A Core Change?

- First fork this repo
- Make the change on your fork
- Follow the ["Hacking on Atom Core"](https://flight-manual.atom.io/hacking-atom/sections/hacking-on-atom-core/) which will
    - tell you about the dependencies
    - explain what commands to run
    - provide different build options
- Test your changes
- Then create a new pull request [here](https://github.com/atom-community/atom/pulls)

# How Can I Propose A Change To A Core Package?

- If the the core package has its own repository, then
    1. Fork the package repo
    2. Have Atom use your version of the package [details here](https://flight-manual.atom.io/hacking-atom/sections/contributing-to-official-atom-packages/)
    3. Test it and make a PR on the package repo
    4. If/When your PR is ignored, make a PR on the Atom-Commuity repo asking to switch to your fork instead of using the old repository

- If the core package doesn't have its own repository, then follow the instructions above for "How Can I Propose A Core Change?"


## How Do I Build Atom?

Currently, refer to the Atom-Original documentation:

* [Linux](https://flight-manual.atom.io/hacking-atom/sections/hacking-on-atom-core/#platform-linux)
* [macOS](https://flight-manual.atom.io/hacking-atom/sections/hacking-on-atom-core/#platform-mac)
* [Windows](https://flight-manual.atom.io/hacking-atom/sections/hacking-on-atom-core/#platform-windows)
