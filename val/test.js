var expect = require('expect.js')

describe('validator', () => {
  var val

  beforeEach(() => {
    val = require('.')({
      isString: () => (value) => typeof value === 'string',
      hasLength: (length) => (value) => value.length === length
    })
  })

  it('should resolve when no validator is set', () => {
    expect(val('foooo')).to.be.ok()
  })

  it('should single validator', () => {
    var isString = val.isString();
    expect(isString('foooo')).to.be.ok()
    expect(isString(1)).to.not.be.ok()
  })

  it('should multiple validator', () => {
    var isShortString = val.isString().hasLength(2);
    expect(isShortString('fo')).to.be.ok()
    expect(isShortString('foooo')).to.not.be.ok()
    expect(isShortString(1)).to.not.be.ok()
  })

  it('should emit message of the failing validator', () => {
    var isString = val.isString('should be a string')
    expect(isString(1)).to.be('should be a string')
  })
})
