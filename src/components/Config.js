const _ = require('lodash')
const path = require('path')
const {constants} = require('./VisionWrap')
const Provider = require('./Provider')
const TruffleError = require('@truffle/error')
const Module = require('module')
const findUp = require('find-up')
const originalrequire = require('original-require')

const DEFAULT_CONFIG_FILENAME = 'visionbox.js'
const BACKUP_CONFIG_FILENAME = 'visionbox-config.js' // For Windows + Command Prompt

function Config(truffle_directory, working_directory, network) {
  const self = this
  const default_tx_values = constants.deployParameters
  this._values = {
    truffle_directory: truffle_directory || path.resolve(path.join(__dirname, '../')),
    working_directory: working_directory || process.cwd(),
    network: network,
    networks: {},
    verboseRpc: false,
    privateKey: null,
    fullHost: null,
    fullNode: null,
    solidityNode: null,
    eventServer: null,
    feeLimit: null,
    userFeePercentage: null,
    originEntropyLimit: null,
    tokenValue: null,
    tokenId: null,
    callValue: null,
    from: null,
    build: null,
    resolver: null,
    artifactor: null,
    ethpm: {
      ipfs_host: 'ipfs.infura.io',
      ipfs_protocol: 'https',
      registry: '0x8011df4830b4f696cd81393997e5371b93338878',
      install_provider_uri: 'https://ropsten.infura.io/truffle'
    },
    solc: {
      optimizer: {
        enabled: false,
        runs: 200
      }
    },
    logger: {
      log: function () {
      },
    }
  }

  const props = {
    // These are already set.
    truffle_directory: function () {
    },
    working_directory: function () {
    },
    network: function () {
    },
    networks: function () {
    },
    verboseRpc: function () {
    },
    build: function () {
    },
    resolver: function () {
    },
    artifactor: function () {
    },
    ethpm: function () {
    },
    solc: function () {
    },
    logger: function () {
    },

    build_directory: function () {
      return path.join(self.working_directory, 'build')
    },
    contracts_directory: function () {
      return path.join(self.working_directory, 'contracts')
    },
    contracts_build_directory: function () {
      return path.join(self.build_directory, 'contracts')
    },
    migrations_directory: function () {
      return path.join(self.working_directory, 'migrations')
    },
    test_directory: function () {
      return path.join(self.working_directory, 'test')
    },
    test_file_extension_regexp: function () {
      return /.*\.(js|es|es6|jsx|sol)$/
    },
    example_project_directory: function () {
      return path.join(self.truffle_directory, 'example')
    },
    network_id: {
      get: function () {
        try {
          return self.network_config.network_id
        } catch (e) {
          return null
        }
      },
      set: function () {
        throw new Error('Do not set config.network_id. Instead, set config.networks and then config.networks[<network name>].network_id')
      }
    },
    network_config: {
      get: function () {
        const network = self.network

        if (!network) {
          throw new Error('Network not set. Cannot determine network to use.')
        }

        return _.extend({}, default_tx_values, self.networks[network] || {})
      },
      set: function () {
        throw new Error("Don't set config.network_config. Instead, set config.networks with the desired values.")
      }
    },
    from: {
      get: function () {
        try {
          return self.network_config.from
        } catch (e) {
          return default_tx_values.from
        }
      },
      set: function () {
        throw new Error("Don't set config.from directly. Instead, set config.networks and then config.networks[<network name>].from")
      }
    },
    privateKey: {
      get: function () {
        try {
          return self.network_config.privateKey
        } catch (e) {
          return default_tx_values.privateKey
        }
      },
      set: function () {
        throw new Error("Don't set config.privateKey directly. Instead, set config.networks and then config.networks[<network name>].privateKey")
      }
    },
    fullNode: {
      get: function () {
        try {
          return self.network_config.fullNode
        } catch (e) {
          return default_tx_values.fullNode
        }
      },
      set: function () {
        throw new Error("Don't set config.fullNode directly. Instead, set config.networks and then config.networks[<network name>].fullNode")
      }
    },
    fullHost: {
      get: function () {
        try {
          return self.network_config.fullHost
        } catch (e) {
          return default_tx_values.fullHost
        }
      },
      set: function () {
        throw new Error("Don't set config.fullHost directly. Instead, set config.networks and then config.networks[<network name>].fullHost")
      }
    },
    solidityNode: {
      get: function () {
        try {
          return self.network_config.solidityNode
        } catch (e) {
          return default_tx_values.solidityNode
        }
      },
      set: function () {
        throw new Error("Don't set config.solidityNode directly. Instead, set config.networks and then config.networks[<network name>].solidityNode")
      }
    },
    eventServer: {
      get: function () {
        try {
          return self.network_config.eventServer
        } catch (e) {
          return default_tx_values.eventServer
        }
      },
      set: function () {
        throw new Error("Don't set config.eventServer directly. Instead, set config.networks and then config.networks[<network name>].eventServer")
      }
    },
    userFeePercentage: {
      get: function () {
        try {
          return self.network_config.userFeePercentage || self.network_config.consume_user_resource_percent
        } catch (e) {
          return default_tx_values.userFeePercentage
        }
      },
      set: function () {
        throw new Error("Don't set config.userFeePercentage directly. Instead, set config.networks and then config.networks[<network name>].userFeePercentage")
      }
    },
    feeLimit: {
      get: function () {
        try {
          return self.network_config.feeLimit || self.network_config.fee_limit
        } catch (e) {
          return default_tx_values.feeLimit
        }
      },
      set: function () {
        throw new Error("Don't set config.feeLimit directly. Instead, set config.networks and then config.networks[<network name>].feeLimit")
      }
    },
    originEntropyLimit: {
      get: function () {
        try {
          return self.network_config.originEntropyLimit
        } catch (e) {
          return default_tx_values.originEntropyLimit
        }
      },
      set: function () {
        throw new Error("Don't set config.originEntropyLimit directly. Instead, set config.networks and then config.networks[<network name>].originEntropyLimit")
      }
    },
    tokenValue: {
      get: function () {
        try {
          return self.network_config.tokenValue
        } catch (e) {
          // no default value
        }
      },
      set: function () {
        throw new Error("Don't set config.tokenValue directly. Instead, set config.networks and then config.networks[<network name>].tokenValue")
      }
    },
    tokenId: {
      get: function () {
        try {
          return self.network_config.tokenId
        } catch (e) {
          // no default value
        }
      },
      set: function () {
        throw new Error("Don't set config.tokenId directly. Instead, set config.networks and then config.networks[<network name>].tokenId")
      }
    },
    provider: {
      get: function () {
        if (!self.network) {
          return null
        }

        const options = self.network_config
        options.verboseRpc = self.verboseRpc
        return Provider.create(options)
      },
      set: function () {
        throw new Error("Don't set config.provider directly. Instead, set config.networks and then set config.networks[<network name>].provider")
      }
    },
    callValue: {
      get: function () {
        try {
          return self.network_config.callValue || self.network_config.call_value
        } catch (e) {
          return default_tx_values.callValue
        }
      },
      set: function () {
        throw new Error("Don't set config.callValue directly. Instead, set config.networks and then config.networks[<network name>].callValue")
      }
    },
  }

  Object.keys(props).forEach(function (prop) {
    self.addProp(prop, props[prop])
  })

}

Config.prototype.addProp = function (key, obj) {
  Object.defineProperty(this, key, {
    get: obj.get || function () {
      return this._values[key] || obj()
    },
    set: obj.set || function (val) {
      this._values[key] = val
    },
    configurable: true,
    enumerable: true
  })
}

Config.prototype.normalize = function (obj) {
  const clone = {}
  Object.keys(obj).forEach(function (key) {
    try {
      clone[key] = obj[key]
    } catch (e) {
      // Do nothing with values that throw.
    }
  })
  return clone
}

Config.prototype.with = function (obj) {
  const normalized = this.normalize(obj)
  const current = this.normalize(this)

  return _.extend({}, current, normalized)
}

Config.prototype.merge = function (obj) {
  const self = this
  const clone = this.normalize(obj)

  // Only set keys for values that don't throw.
  Object.keys(obj).forEach(function (key) {
    try {
      self[key] = clone[key]
    } catch (e) {
      // Do nothing.
    }
  })

  return this
}

Config.default = function () {
  return new Config()
}

Config.detect = function (options, filename) {
  let search;

  (!filename)
    ? search = [DEFAULT_CONFIG_FILENAME, BACKUP_CONFIG_FILENAME]
    : search = filename

  const file = findUp.sync(search, {cwd: options.working_directory || options.workingDirectory})

  if (!file) {
    throw new TruffleError('Could not find suitable configuration file.')
  }

  return this.load(file, options)
}

Config.load = function (file, options) {
  const config = new Config()

  config.working_directory = path.dirname(path.resolve(file))

  // The require-nocache module used to do this for us, but
  // it doesn't bundle very well. So we've pulled it out ourselves.
  delete require.cache[Module._resolveFilename(file, module)]
  const static_config = originalrequire(file)

  config.merge(static_config)
  config.merge(options)

  return config
}

module.exports = Config
