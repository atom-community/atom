# papm

Performant Atom Package Manager

![Github Actions](https://github.com/atom-community/papm/workflows/CI/badge.svg)
[![Dependency Status](https://david-dm.org/atom-community/papm.svg)](https://david-dm.org/atom-community/papm)

# Roadmap

## Implementation Requirements (Future Features)

- `papm` shall use `pnpm`
- `papm` shall not use GitHub tags for publishing (See [this](https://github.com/atom/apm/issues/919) for the background)
- `papm` shall either publish the atom packages to a `npm` registry, or use GitHub packages
- `papm` shall be able to install the packages that are published on the old registry (backward compatibility)
- `papm` operations shall not block the UI
- `papm` shall handle failed installations, bad connections, etc.

## Strategy

The strategy I suggest is to:

- [x] decaffeinate each file
- [x] improve build process
- [ ] replace the old dependencies of the resulting code with modern replacements
- [ ] replace npm things with pnpm
- [ ] In the end, we can think about publishing on the `npm` registry or using Github packages

# Setup

Everything is detailed in the `documentation/setup.md`!
