const wrapper = require('solc/wrapper')
const chalk = require('chalk')
let {name} = require('../../package')
const path = require('path')
const fs = require('fs-extra')
const {execSync} = require('child_process')
const Config = require('./Config')

let supportedVersions = [
  '0.8.0',
  '0.7.6',
  '0.6.12',
  '0.5.1'
]

const maxVersion = '0.8.0'

function getWrapper(options = {}) {
  supportedVersions =
    supportedVersions.map( a => a.split('.').map( n => +n+100000 ).join('.')).sort()
      .map( a => a.split('.').map( n => +n-100000 ).join('.'));
  
  const config = Config.detect(options)
  
  let compilerVersion = config.networks.compilers.solc.version
  if (!supportedVersions.includes(compilerVersion)) {

    console.error(chalk.red(chalk.bold('ERROR:') + 'Invalid compile version provided'))
    throw new Error('Invalid compile version provided')
  }
  const solcDir = "../../solcjs"

  const soljsonPath = path.join(solcDir, `v${compilerVersion}.js`)
  // TODO
  const soljson = eval('require')(soljsonPath)
  return wrapper(soljson)
}

module.exports.getWrapper = getWrapper
module.exports.supportedVersions = supportedVersions
module.exports.maxVersion = maxVersion
