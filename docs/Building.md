
## Building

* [Linux](https://flight-manual.atom.io/hacking-atom/sections/hacking-on-atom-core/#platform-linux)
* [macOS](https://flight-manual.atom.io/hacking-atom/sections/hacking-on-atom-core/#platform-mac)
* [Windows](https://flight-manual.atom.io/hacking-atom/sections/hacking-on-atom-core/#platform-windows)

## Alternative method

First, install yarn. Package dependency with NPM is weird and crashes randomly. You'll also need to have Python 3 installed, and some binary dependencies defined on the Flight Manual.

Then run `yarn install`. Finally, run `yarn run build` to compile binaries for Electron, `yarn apm:install` to install the Atom Package Manager, and `yarn start` should work if everything passed.

To create binaries to install Atom, run `yarn dist`. This will create binaries for your operating system under `binaries` directory
