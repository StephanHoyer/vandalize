var FALLBACK_MESSAGE = 'validation failed'

function validate(fn, value, exceptionMode) {
  if (exceptionMode) {
    return fn(value)
  }
  try {
    return fn(value)
  } catch (err) {
    return err instanceof Error ? err.message : err
  }
}

function validateRed(value, mode) {
  var allMode = mode === 'all'
  var exceptionMode = mode === 'exception'
  return function (result, fn) {
    if (!allMode && result !== true) {
      // return first occured error
      return result
    }
    var isValid = validate(fn, value, exceptionMode)
    if (!allMode) {
      return isValid
    }
    // if in all mode, collect the error and continue with the next validator
    if (isValid !== true) {
      result.push(isValid || FALLBACK_MESSAGE)
    }
    return result
  }
}

module.exports = function init (fns, options, stack) {
  options = options || {}
  stack = stack || []
  function api (value) {
    var result = stack.reduce(validateRed(value, options.mode), options.mode === 'all' ? [] : true)
    if (result !== true && options.mode === 'exception') {
      throw new Error(result || FALLBACK_MESSAGE)
    }
    return result
  }
  fns.object = function(schema) {
    return function(obj) {
      var result = Object.keys(schema).reduce(function(result, key) {
        isValid = validateRed(obj[key], options.mode)(result, schema[key])
        return isValid
      }, options.mode === 'all' ? [] : true)
      if (result !== true && options.mode === 'exception') {
        throw new Error(result || FALLBACK_MESSAGE)
      }
      return result
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

