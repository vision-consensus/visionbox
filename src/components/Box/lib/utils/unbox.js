const fs = require('fs-extra')
const path = require('path')
const ghdownload = require('github-download')
const request = require('request')
const vcsurl = require('vcsurl')
// eslint-disable-next-line node/no-deprecated-api
const parseURL = require('url').parse
const tmp = require('tmp')
const exec = require('child_process').exec
const cwd = process.cwd()

const config = require('../config')

function checkDestination(destination) {
  return Promise.resolve().then(function () {

    const contents = fs.readdirSync(destination)
    if (contents.length) {
      const err = 'Something already exists at the destination. ' +
        '`visionbox init` and `visionbox unbox` must be executed in an empty folder. ' +
        'Stopping to prevent overwriting data.'

      throw new Error(err)
    }
  })
}

function verifyURL(url) {
  // Next let's see if the expected repository exists. If it doesn't, ghdownload
  // will fail spectacularly in a way we can't catch, so we have to do it ourselves.
  return new Promise(function (accept, reject) {

    const configURL = parseURL(
      vcsurl(url)
        .replace('github.com', 'raw.githubusercontent.com')
        .replace(/#.*/, '') +
      '/develop/visionbox.js'
    )

    const options = {
      method: 'HEAD',
      uri: 'https://' + configURL.host + configURL.path
    }
    request(options, function (error, r) {
      if (error) {
        return reject(new Error(
          'Error making request to ' + options.uri + '. Got error: ' + error.message +
          '. Please check the format of the requested resource.'
        ))
      } else if (r.statusCode === 404) {
        return reject(new Error('visionbox Box at URL ' + url + " doesn't exist. If you believe this is an error, please contact visionbox support."))
      } else if (r.statusCode !== 200) {
        return reject(new Error('Error connecting to github.com. Please check your internet connection and try again.'))
      }
      accept()
    })
  })
}

function setupTempDirectory() {
  return new Promise(function (accept, reject) {
    tmp.dir({dir: cwd, unsafeCleanup: true}, function (err, dir, cleanupCallback) {
      if (err) return reject(err)

      accept(path.join(dir, 'box'), cleanupCallback)
    })
  })
}

function fetchRepository(url, dir) {
  return new Promise(function (accept, reject) {
    // Download the package from github.
    ghdownload(url + "#develop", dir)
      .on('err', function (err) {
        reject(err)
      })
      .on('end', function () {
        accept()
      })
  })
}

function copyTempIntoDestination(tmpDir, destination) {
  return new Promise(function (accept, reject) {
    fs.copy(tmpDir, destination, function (err) {
      if (err) return reject(err)
      accept()
    })
  })
}

function readBoxConfig(destination) {
  const possibleConfigs = [
    path.join(destination, 'visionbox.json'),
    path.join(destination, 'visionbox-init.json')
  ]

  const configPath = possibleConfigs.reduce(function (path, alt) {
    return path || fs.existsSync(alt) && alt
  }, undefined)

  return config.read(configPath)
}

function cleanupUnpack(boxConfig, destination) {
  const needingRemoval = boxConfig.ignore || []

  // remove box config file
  needingRemoval.push('visionbox.json')
  needingRemoval.push('visionbox-init.json')

  const promises = needingRemoval.map(function (file_path) {
    return path.join(destination, file_path)
  }).map(function (file_path) {
    return new Promise(function (accept, reject) {
      fs.remove(file_path, function (err) {
        if (err) return reject(err)
        accept()
      })
    })
  })

  return Promise.all(promises)
}

function installBoxDependencies(boxConfig, destination) {
  const postUnpack = boxConfig.hooks['post-unpack']

  return new Promise(function (accept, reject) {
    if (postUnpack.length === 0) {
      return accept()
    }

    exec(postUnpack, {cwd: destination}, function (err, stdout, stderr) {
      if (err) return reject(err)
      accept(stdout, stderr)
    })
  })
}

module.exports = {
  checkDestination: checkDestination,
  verifyURL: verifyURL,
  setupTempDirectory: setupTempDirectory,
  fetchRepository: fetchRepository,
  copyTempIntoDestination: copyTempIntoDestination,
  readBoxConfig: readBoxConfig,
  cleanupUnpack: cleanupUnpack,
  installBoxDependencies: installBoxDependencies
}
