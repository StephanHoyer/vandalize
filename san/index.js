var BREAK = { break: true }

module.exports = function init(fns, stack) {
  stack = stack || []
  function api(value) {
    stack.every(function(fn) {
      return (value = fn(value)) !== BREAK
    })
    return value
  }
  fns.combine = function(fn1, fn2) {
    return function (value) {
      return fn2(fn1(value))
    }
  }
  fns.object = function(schema, options) {
    var options = options || {}
    return function(obj) {
      return Object.keys(schema).reduce(function(sanitizedObject, key) {
        var value = schema[key](obj[key])
        if (value !== BREAK) {
          sanitizedObject[key] = value
        }
        return sanitizedObject
      }, {})
    }
  }
  fns.optional = function() {
    return function(value) {
      if (value != null) {
        return value
      }
      return BREAK
    }
  }
  return Object.keys(fns).reduce(function(api, key) {
    api[key] = function() {
      return init(fns, stack.concat(fns[key].apply(null, arguments)))
    }
    return api
  }, api)
}
