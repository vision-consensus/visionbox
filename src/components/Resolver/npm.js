const path = require('path')
const fs = require('fs')

function NPM(working_directory) {
  this.working_directory = working_directory
}

NPM.prototype.require = function (import_path, search_path) {
  if (import_path.indexOf('.') === 0 || import_path.indexOf('/') === 0) {
    return null
  }
  const contract_name = path.basename(import_path, '.sol')
  const regex = new RegExp(`(.*)/${contract_name}`)
  let package_name = ''
  const matched = regex.exec(import_path)
  if (matched) {
    package_name = matched[1]
  }
  const expected_path = path.join((search_path || this.working_directory), 'node_modules', package_name, 'build', 'contracts', contract_name + '.json')
  try {
    const result = fs.readFileSync(expected_path, 'utf8')
    return JSON.parse(result)
  } catch (e) {
    return null
  }
}

NPM.prototype.resolve = function (import_path, imported_from, callback) {

  // If nothing's found, body returns `undefined`
  let body
  let modulesDir = this.working_directory

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const expected_path = path.join(modulesDir, 'node_modules', import_path)

    try {
      body = fs.readFileSync(expected_path, {encoding: 'utf8'})
      break
    } // eslint-disable-next-line no-empty
    catch (err) {
    }

    // Recurse outwards until impossible
    const oldModulesDir = modulesDir
    modulesDir = path.join(modulesDir, '..')
    if (modulesDir === oldModulesDir) {
      break
    }
  }
  return callback(null, body, import_path)
}

// We're resolving package paths to other package paths, not absolute paths.
// This will ensure the source fetcher conintues to use the correct sources for packages.
// i.e., if some_module/contracts/MyContract.sol imported "./AnotherContract.sol",
// we're going to resolve it to some_module/contracts/AnotherContract.sol, ensuring
// that when this path is evaluated this source is used again.
NPM.prototype.resolve_dependency_path = function (import_path, dependency_path) {
  const dirname = path.dirname(import_path)
  return path.join(dirname, dependency_path)
}

NPM.prototype.provision_contracts = function (callback) {
  // TODO: Fill this out!
  callback(null, {})
}


module.exports = NPM
