const wrapper = require('solc/wrapper')
let {name} = require('../../package')
const path = require('path')
const fs = require('fs-extra')
const {execSync} = require('child_process')

let supportedVersions = [
  '0.5.10'
]

const maxVersion = '0.5.10'

function getWrapper(options = {}) {
  supportedVersions =
    supportedVersions.map( a => a.split('.').map( n => +n+100000 ).join('.')).sort()
      .map( a => a.split('.').map( n => +n-100000 ).join('.'));

  let compilerVersion = '0.5.10'
  const solcDir = "../../solcjs"

  const soljsonPath = path.join(solcDir, `v${compilerVersion}.js`)
  // TODO
  const soljson = eval('require')(soljsonPath)
  return wrapper(soljson)
}

module.exports.getWrapper = getWrapper
module.exports.supportedVersions = supportedVersions
module.exports.maxVersion = maxVersion
