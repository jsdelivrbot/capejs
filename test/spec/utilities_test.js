'use strict'

describe('Cape', () => {
  describe('extend', () => {
    it('should merge the properties of objects into the first.', () => {
      var obj1 = { a: 1, b: 2, c: 3 }
      var obj2 = { a: 4, d: 5 }
      var obj3 = { d: 6, e: 7 }

      Cape.extend(obj1, obj2, obj3)
      expect(obj1.a).to.equal(4)
      expect(obj1.b).to.equal(2)
      expect(obj1.c).to.equal(3)
      expect(obj1.d).to.equal(6)
      expect(obj1.e).to.equal(7)
    })
  })

  describe('deepExtend', () => {
    it('should merge the properties of objects into the first recursively.',
      () => {
      var obj1 = { a: { b: { c: 1, d: 2 } }, x: { y: 3 } }
      var obj2 = { a: { b: { d: 4 } }, x: { z: 5 } }
      var obj3 = { a: { b: { e: { f: 6 } } }, x: { } }

      Cape.deepExtend(obj1, obj2, obj3)
      expect(obj1.a.b.c).to.equal(1)
      expect(obj1.a.b.d).to.equal(4)
      expect(obj1.a.b.e.f).to.equal(6)
      expect(obj1.x.y).to.equal(3)
      expect(obj1.x.z).to.equal(5)
    })
  })

  describe('merge', () => {
    it('should merge (but not override) the properties of objects into the first.',
      () => {
      var obj1 = { a: 1, b: 2, c: 3 }
      var obj2 = { a: 4, d: 5 }
      var obj3 = { d: 6, e: 7 }

      Cape.merge(obj1, obj2, obj3)
      expect(obj1.a).to.equal(1)
      expect(obj1.b).to.equal(2)
      expect(obj1.c).to.equal(3)
      expect(obj1.d).to.equal(5)
      expect(obj1.e).to.equal(7)
    })
  })
})
