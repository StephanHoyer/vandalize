module.exports = function init (fns, options, stack) {
  options = options || {}
  stack = stack || []
  function api (value) {
    var allMode = options.mode === 'all'
    var exceptionMode = options.mode === 'exception'
    var result = true
    var errors = []
    // in all mode we run through all validators (map),
    // in first/exception mode we stop with the first error (every)
    var walker = allMode ? 'map' : 'every'
    stack[walker](function (fn) {
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
      if (allMode) {
        // if in all mode, collect the error and continue with the next validator
        if (isValid !== true) {
          errors.push(isValid || 'validation failed')
        }
        return
      }
      result = isValid
      if (typeof isValid === 'boolean') {
        return isValid
      }
      // if anything other than a true or false is returned by the validator
      // we consider that as an error message an stop validating
      return false
    })
    if (exceptionMode) {
      throw new Error(result)
    }
    return allMode ? errors : result
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

