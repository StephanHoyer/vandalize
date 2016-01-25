# vandalize
functional minimal framework to create your own validation/sanitation lib

## create a sanitizer

```javascript
  // create your base sanitizers
  var san = require('vandalize/san')({
    up: () => (value) => value.toUpperCase(),
    cut: (length) => (value) => value.slice(0, length)
  })

  // combine your sanitizers to your specific sanitizer
  var cleanUsername = san.cut(6).up()

  // use it
  var username = cleanUsername('foobarbaz')
  assert(username === 'FOOBAR')
```

Special handling for objects

```javascript
  var cleanUser = san.object({
    name: val.up(),
    password: val.cut(3)
  })

  var user = cleanUser({
    name: 'mr. hello',
    password: '1234567'
  })

  // it's not really strict equality, this is just for brewity
  assert(user === { name: 'MR. HELLO', password: '123'})
```

## create a validator

```javascript
  // create your base validators
  var val = require('vandalize/val')({
    isString: () => (value) => typeof value === 'string'
    hasLength: (length) => (value) => value.length === length
  })

  // combine your validators to your specific validator
  var isUsername = val.isString().hasLength(5)

  // use it
  assert(isUsername('foobarbaz') === false)
  assert(isUsername(1) === false)
  assert(isUsername('12345') === true)
```

### Special handling for objects

```javascript
  var isUser = val.object({
    name: val.isString(),
    password: val.hasLength(3)
  })

  var result = isUser({
    name: 'mr. hello',
    password: '1234567'
  })

  // it's not really strict equality, this is just for brewity
  assert(result === { key: 'password', message: 'validation failed' })
```

### Use your own message

You can use your own error message by either providing it on the validator
itself or when initilizing your custom validator

```javascript
  var val = require('vandalize/val')({
    isString: () => (value) => {
      return typeof value === 'string' || 'expected string, got ' + typeof value
    }
  })

  var checker = val.isString()

  assert(checker(123) === 'expected string, got number')
```

```javascript
  var val = require('vandalize/val')({
    isString: () => (value) => typeof value === 'string'
  })

  var checker = val.isString('expected string')

  assert(checker(123) === 'expected string')
```

### Exceptions

You can also use exceptions to let a validation fail

```javascript
  var val = require('vandalize/val')({
    isString: () => (value) => {
      if (typeof value !== 'string') {
        throw new Error('expected string, got ' + typeof value)
      }
      return true
    }
  })

  var checker = val.isString()

  assert(checker(123) === 'expected string, got number')
```

### Exception mode

You can also let the lib throw exceptions on a failing validation.

```javascript
  var val = require('vandalize/val')({
    isString: () => (value) => typeof value === 'string' || 'expected string, got ' + typeof value
  }, {
    mode: 'exception'
  })

  var checker = val.isString()

  try {
    assert(checker(123))
  } catch(e) {
    assert(e.message === 'expected string, got number')
  }
```

### All-errors-mode

In all other modes the first error that arises will quit further validation. In
`all`-mode the validation process continues up to the last defined validator.

```javascript
  var val = require('vandalize/val')({
    isString: () => (value) => typeof value === 'string' || 'should be a string, is a ' + typeof value,
    hasLength: (length) => (value) => value.length === length || 'should have length ' + length
  }, {
    mode: 'all'
  })

  var isUsername = val.isString().hasLength(5)

  // it's not really strict equality, this is just for brewity
  assert(isUsername('foobarbaz') === ['should have length 5'])
  assert(isUsername(1) === ['should be a string, is a number', 'should have length 5'])
  assert(isUsername('12345') === [])
```

`exeption`- and `all`-mode are also supported for objects. See the tests for detailed example.
