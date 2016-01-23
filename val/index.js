module.exports = function init(fns, stack) {
  stack = stack || []
  function api(value) {
    result = true
    stack.every(function(fn) {
      var isValid = fn(value)
      result = isValid
      if (typeof isValid === 'boolean') {
        return isValid
      }
      // if anything other than a true or false is returned by the validator
      // we consider that as an error message an stop validating
      return false
    })
    return result
  }
  return Object.keys(fns).reduce(function(api, key) {
    api[key] = function() {
      var fn = fns[key]
      var args = [].slice.call(arguments)
      var stackFn = fn.apply(null, arguments)
      if (fn.length < args.length) {
        var message = args.pop()
        stackFn = function(value) {
          if (fn.apply(null, args)(value)) {
            return true
          }
          return message
        }
      }
      return init(fns, stack.concat(stackFn))
    }
    return api
  }, api)
}

