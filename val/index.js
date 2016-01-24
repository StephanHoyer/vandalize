module.exports = function (fns, options) {
  var FALLBACK_MESSAGE = 'validation failed'
  options = options || {}

  function isExceptionMode () {
    return options.mode === 'exception'
  }
  function isAllMode () {
    return options.mode === 'all'
  }

  function validate (fn, value) {
    if (isExceptionMode()) {
      return fn(value)
    }
    try {
      return fn(value)
    } catch (err) {
      return err instanceof Error ? err.message : err
    }
  }

  function validateRed (value, mode) {
    return function (result, fn) {
      if (!isAllMode() && result !== true) {
        // return first occured error
        return result
      }
      var isValid = validate(fn, value)
      if (!isAllMode()) {
        return isValid
      }
      // if in all mode, collect the error and continue with the next validator
      if (isValid !== true) {
        result.push(isValid || FALLBACK_MESSAGE)
      }
      return result
    }
  }

  function objectValidator (schema) {
    return function (obj) {
      var result = Object.keys(schema).reduce(function (objResult, key) {
        var isValid
        try {
          isValid = validateRed(obj[key])(isAllMode() ? [] : true, schema[key])
        } catch (e) {
          e.key = key
          throw e
        }
        if (isValid !== true) {
          if (!isAllMode()) {
            return { message: isValid, key: key }
          }
          objResult[key] = isValid[0]
          return objResult
        }
        return isValid
      }, isAllMode() ? {} : true)
      if (result !== true && isExceptionMode()) {
        throw new Error(result || FALLBACK_MESSAGE)
      }
      return result
    }
  }

  function init (stack) {
    function api (value) {
      var result = stack.reduce(validateRed(value), isAllMode() ? [] : true)
      if (result !== true && isExceptionMode()) {
        throw new Error(result || FALLBACK_MESSAGE)
      }
      return result
    }
    fns.object = objectValidator
    return Object.keys(fns).reduce(function (api, key) {
      api[key] = function () {
        var fn = fns[key]
        var args = [].slice.call(arguments)
        var stackFn = fn.apply(null, args)
        if (fn.length < args.length) {
          // we have more args than the validator,
          // so we expect the last one to be the error message
          var message = args.pop()
          stackFn = function (value) {
            return fn.apply(null, args)(value) ? true : message
          }
        }
        return init(stack.concat(stackFn))
      }
      return api
    }, api)
  }

  return init([])
}

