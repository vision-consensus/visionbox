const fs = require('fs-extra')

function setDefaults(config) {
  config = config || {}

  const hooks = config.hooks || {}

  return {
    ignore: config.ignore || [],
    commands: config.commands || {
      compile: 'visionbox compile',
      migrate: 'visionbox migrate',
      test: 'visionbox test'
    },
    hooks: {
      'post-unpack': hooks['post-unpack'] || ''
    }
  }
}

function read(path) {
  return fs.readFile(path)
    .catch(function () {
      return '{}'
    })
    .then(JSON.parse)
    .then(setDefaults)
}

module.exports = {
  read: read,
  setDefaults: setDefaults
}
