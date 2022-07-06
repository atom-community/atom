See the [Hacking on Atom Core](https://flight-manual.atom.io/hacking-atom/sections/hacking-on-atom-core/#platform-linux) section in the [Atom Flight Manual](https://flight-manual.atom.io).

## Longer answer

First, install yarn. Package dependency with NPM is weird and crashes randomly. You'll also need to have Python 3 installed, and some binary dependencies defined on the Flight Manual.

Then run `yarn install`. Finally, run `yarn run build`, and `yarn start` should work if everything was correct
