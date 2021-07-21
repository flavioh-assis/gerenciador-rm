# Registration Number Manager / Gerenciador de RM
🇺🇸/🇬🇧: Student registration number manager for schools<br />
🇧🇷: Gerenciador de RM para a EMEB. Maria Virgínia Matarazzo Ippólito

# The Project
* Missions:
  * Create a desktop software that helps the registration data management
  * It must be easy to use, quick to run and responsive
  * Help to reduce the most common user errors

* Tools:
  * [Electron](https://www.electronjs.org/): build the desktop application
  * [React](https://reactjs.org/): build the UI
  * [Node.js](https://nodejs.org/en/): back-end
  * [SQLite](https://www.sqlite.org/index.html): database

* Design, Coded and Tested by:
  * [Flavio Assis](https://github.com/flavioh-assis)
  
* License:
  * [MIT](./LICENSE)
  
## Quick start

Clone the repository
```bash
git clone --depth=1 https://github.com/flavioh-assis/rm_manager
```

Install dependencies
```bash
cd rm_manager & yarn install
```

Development
```bash
yarn start
```

## DevTools

Toggle DevTools:

* Linux/Windows: <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>I</kbd> or <kbd>F12</kbd>

## Packaging

Modify [electron-builder.yml](./electron-builder.yml) to edit package info.

For a full list of options see: https://www.electron.build/configuration/configuration

Create a package Linux or Windows using one of the following commands:

```
yarn run pack:linux
yarn run pack:win
```
