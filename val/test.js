var expect = require('expect.js')
var validator = require('.')

describe('validator', () => {
  var val
  var options = {}

  beforeEach(() => {
    val = validator({
      isString: () => (value) => typeof value === 'string',
      hasLength: (length) => (value) => value.length === length,
      invalid: () => () => 'invalid as expected',
      thrower: () => () => { throw new Error('thrown as expected') }
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
    expect(shouldFail(1)).to.be('invalid as expected')
  })

  it('should emit thrown error as message', () => {
    var shouldFail = val.thrower()
    expect(shouldFail(1)).to.be('thrown as expected')
  })

  describe('exception mode', () => {
    beforeEach(() => {
      options.mode = 'exception'
    })

    it('should throw exceptions message the failing validator', () => {
      var shouldFail = val.invalid()
      expect(() => shouldFail(1)).to.throwError(/^invalid as expected$/)
    })

    it('should forward exceptions thrown in validator', () => {
      var shouldFail = val.thrower()
      expect(() => shouldFail(1)).to.throwError(/^thrown as expected$/)
    })
  })

  describe('all error mode', () => {
    beforeEach(() => {
      options.mode = 'all'
    })

    it('should give an empty array if all is ok', () => {
      var isString = val.isString()
      expect(isString('foo')).to.eql([])
    })

    it('should give an array of validation errors', () => {
      var shouldFail = val.invalid().isString('should be a string')
      expect(shouldFail(1)).to.eql(['invalid as expected', 'should be a string'])
    })

    it('should give "validation failed" as fallback message', () => {
      var shouldFail = val.isString()
      expect(shouldFail(1)).to.eql(['validation failed'])
    })
  })
})
