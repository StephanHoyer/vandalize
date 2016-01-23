var expect = require('expect.js')
var validator = require('.')

describe('validator', () => {
  var val
  var options = {}

  beforeEach(() => {
    val = validator({
      isString: () => (value) => typeof value === 'string',
      hasLength: (length) => (value) => value.length === length,
      invalid: () => () => 'validator failed',
      thrower: () => () => { throw new Error('validator failed') }
    }, options)
  })

  it('should resolve when no validator is set', () => {
    expect(val('foooo')).to.be.ok()
  })

  it('should single validator', () => {
    var isString = val.isString()
    expect(isString('foooo')).to.be.ok()
    expect(isString(1)).to.not.be.ok()
  })

  it('should multiple validator', () => {
    var isShortString = val.isString().hasLength(2)
    expect(isShortString('fo')).to.be.ok()
    expect(isShortString('foooo')).to.not.be.ok()
    expect(isShortString(1)).to.not.be.ok()
  })

  it('should emit message of chain when validator fails', () => {
    var isString = val.isString('should be a string')
    expect(isString(1)).to.be('should be a string')
  })

  it('should emit message of the failing validator', () => {
    var shouldFail = val.invalid()
    expect(shouldFail(1)).to.be('validator failed')
  })

  it('should emit thrown error as message', () => {
    var shouldFail = val.thrower()
    expect(shouldFail(1)).to.be('validator failed')
  })

  describe('exception mode', () => {
    beforeEach(() => {
      options.mode = 'exception'
    })

    it('should throw exceptions message the failing validator', () => {
      var shouldFail = val.invalid()
      expect(() => shouldFail(1)).to.throwError(/^validator failed$/)
    })

    it('should forward exceptions thrown in validator', () => {
      var shouldFail = val.thrower()
      expect(() => shouldFail(1)).to.throwError(/^validator failed$/)
    })
  })
})
