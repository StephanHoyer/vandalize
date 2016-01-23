var san = require('.')({
  up: () => (value) => value.toUpperCase(),
  cut: (length) => (value) => value.slice(0, length),
})
var expect = require('expect.js')

describe('sanitizer', () => {

  it('should do nothing when no sanitizer is set', () => {
    expect(san('foo')).to.be('foo')
  })

  it('should use sanitizers', () => {
    var upper = san.up()
    var upperCut = upper.cut(2)
    expect(upper('foo')).to.be('FOO')
    expect(upperCut('bar')).to.be('BA')
  })

  it('should combine sanitizers', () => {
    var upper = san.up()
    var cut = san.cut(2)

    var upperCut = san.combine(upper, cut)
    expect(upperCut('bar')).to.be('BA')
  })

  describe('objects', () => {
    var user

    beforeEach(function() {
      user = {
        name: 'foo',
        password: 'bar',
        unwanted: 'baz'
      }
    })

    it('should work', () => {
      var sanUser = san.object({
        name: san.up(),
        password: san.cut(2)
      })
      expect(sanUser(user)).to.eql({
        name: 'FOO',
        password: 'ba'
      })
    })

    it('should allow optional fields', () => {
      var sanUser = san.object({
        name: san.up(),
        password: san.cut(2),
        optionalField: san.optional().up().cut(2)
      })
      expect(sanUser(user)).to.eql({
        name: 'FOO',
        password: 'ba'
      })
      var user2 = {
        name: 'hihi',
        password: 'haha',
        optionalField: 'huhu'
      }
      expect(sanUser(user2)).to.eql({
        name: 'HIHI',
        password: 'ha',
        optionalField: 'HU'
      })
    })
  })
})
