function validate(value, mode) {
  var allMode = mode === 'all'
  var exceptionMode = mode === 'exception'
  return function (result, fn) {
    if (!allMode && result !== true) {
      return result
    }
    var isValid
    try {
      isValid = fn(value)
    } catch (err) {
      if (exceptionMode) {
        throw err
      }
      // not in exception mode, unwrap the exception
      isValid = err instanceof Error ? err.message : err
    }
    if (!allMode) {
      return isValid
    }
    // if in all mode, collect the error and continue with the next validator
    if (isValid !== true) {
      result.push(isValid || 'validation failed')
    }
    return result
  }
}

module.exports = function init (fns, options, stack) {
  options = options || {}
  stack = stack || []
  function api (value) {
    var allMode = options.mode === 'all'
    var exceptionMode = options.mode === 'exception'
    var result = stack.reduce(validate(value, options.mode), allMode ? [] : true)
    if (exceptionMode) {
      throw new Error(result)
    }
    return result
  }
  fns.object = function(schema) {
    return function(obj) {
      var isValid = true
      Object.keys(schema).every(function (key) {
        isValid = schema[key](obj[key])
        if (typeof isValid === 'boolean') {
          return isValid
        }
        return false
      })
      return isValid
    }
  }
  return Object.keys(fns).reduce(function (api, key) {
    api[key] = function () {
      var fn = fns[key]
      var args = [].slice.call(arguments)
      var stackFn = fn.apply(null, arguments)
      if (fn.length < args.length) {
        // we have more args than the validator,
        // so we expect the last one to be the error message
        var message = args.pop()
        stackFn = function (value) {
          if (fn.apply(null, args)(value)) {
            return true
          }
          return message
        }
      }
      return init(fns, options, stack.concat(stackFn))
    }
    return api
  }, api)
}

