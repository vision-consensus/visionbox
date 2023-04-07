const wrapper = require('solc/wrapper')
const chalk = require('chalk')
let {name} = require('../../package')
const path = require('path')
const fs = require('fs-extra')
const {execSync} = require('child_process')
const Config = require('./Config')

let supportedVersions = [
  '0.8.17-commit.8df45f5f',
  '0.8.8-commit.dddeac2f',
  '0.8.0-commit.d1b2779',
  '0.8.0-commit.c7dfd78e',
  '0.7.6-commit.a64f746',
  '0.7.6-commit.7338295f',
  '0.5.10-commit.3f05b771',
  '0.5.10-commit.5a6ea5b1',
]

const maxVersion = '0.8.17-commit.8df45f5f'

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

  const soljsonPath = path.join(solcDir, `soljson-v${compilerVersion}.js`)
  // TODO
  const soljson = eval('require')(soljsonPath)
  return wrapper(soljson)
}

module.exports.getWrapper = getWrapper
module.exports.supportedVersions = supportedVersions
module.exports.maxVersion = maxVersion
