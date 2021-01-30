require('source-map-support/register')

const Command = require('./lib/command')
const TaskError = require('./lib/errors/taskerror')
const TruffleError = require('@truffle/error')
const version = require('./lib/version')
const OS = require('os')

const command = new Command(require('./lib/commands'))

const options = {
  logger: console
}

command.run(process.argv.slice(2), options, function (err) {
  if (err) {
    if (err instanceof TaskError) {
      command.args
        .usage('Visionbox v' + (version.bundle || version.core) + ' - a development framework for visionweb'
          + OS.EOL + OS.EOL
          + 'Usage: visionbox <command> [options]')
        .epilog('See more at https://cn.developers.v.network')
        .showHelp()
    } else {
      if (err instanceof TruffleError) {
        console.error(err.message)
      } else if (typeof err === 'number') {
        // If a number is returned, exit with that number.
        // eslint-disable-next-line no-process-exit
        process.exit(err)
      } else {
        // Bubble up all other unexpected errors.
        console.error(err.stack || err.toString())
      }
    }
    // eslint-disable-next-line no-process-exit
    process.exit(1)
  }

  // Don't exit if no error; if something is keeping the process open,
  // like `truffle console`, then let it.

  // Clear any polling or open sockets - `provider-engine` in HDWallet
  // and `web3 1.0 confirmations` both leave interval timers etc wide open.
  const handles = process._getActiveHandles()
  handles.forEach(handle => {
    if (typeof handle.close === 'function') {
      handle.close()
    }
  })
})


