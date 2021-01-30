const command = {
  command: 'init',
  description: 'Initialize new and empty visionBox project',
  builder: {},
  run: function (options, done) {
    process.env.CURRENT = 'init'
    const Config = require('../../components/Config')
    const OS = require('os')
    const UnboxCommand = require('./unbox')

    const config = Config.default().with({
      logger: console
    })

    if (options._ && options._.length > 0) {
      config.logger.log(
        'Error: `visionbox init` no longer accepts a project template name as an argument.'
      )
      // eslint-disable-next-line no-process-exit
      process.exit(1)
    }

    const url = 'https://github.com/vision-consensus/bare-visionbox.git'
    options._ = [url]

    UnboxCommand.run(options, done)
  }
}

module.exports = command
