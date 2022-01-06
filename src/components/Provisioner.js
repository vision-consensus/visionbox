const provision = function (abstraction, options) {
  if (options.provider) {
    abstraction.setProvider(options.provider)
  }

  if (options.network_id) {
    abstraction.setNetwork(options.network_id)
  }

  ['from', 'fee_limit', 'consume_user_resource_percent', 'privateKey', 'call_value'].forEach(function (key) {
    if (options[key]) {
      const obj = {}
      obj[key] = options[key]
      abstraction.defaults(obj)
    }
  })

  return abstraction
}

module.exports = provision
