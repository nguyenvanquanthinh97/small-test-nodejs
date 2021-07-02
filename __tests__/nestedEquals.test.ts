import fc, { Arbitrary } from 'fast-check';
import { deepEquals, deepCopy } from '../src';

const EachSimpleType = [
  ['null', fc.constant(null)],
  ['string', fc.string()],
  ['integers', fc.integer()],
  ['doubles', fc.double()],
  ['dates', fc.date()],
] as const;

describe('deepEquals', () => {
  describe.each(EachSimpleType)('Simple type %p', (_, arb: Arbitrary<any>) => {
    test('Should work for simple types', () => {
      fc.assert(
        fc.property(arb, (v) => {
          return deepEquals(v, deepCopy(v));
        }),
      );
    });

    test('Should work for simple arrays', () => {
      fc.assert(
        fc.property(fc.array(arb), (arr) => {
          return deepEquals(arr, deepCopy(arr));
        }),
      );
    });
  });

  test('Should work for simple objects', () => {
    fc.assert(
      fc.property(
        fc.object({ maxDepth: 5, values: [fc.string(), fc.integer(), fc.double(), fc.date()] }),
        (obj: any) => {
          return deepEquals(obj, deepCopy(obj));
        },
      ),
    );
  });

  describe('Incorrect comparisons', () => {
    const arbitrary: Arbitrary<any> = fc.oneof(
      fc.integer(),
      fc.date(),
      fc.object(),
      fc.string(),
      fc.array(fc.integer()),
    );
    test('should fail on different types', () => {
      fc.assert(
        fc.property(arbitrary, arbitrary, (a, b) => {
          // we are testing only when both objects are of different types
          fc.pre(typeof a !== typeof b);
          return deepEquals(a, b) === false;
        }),
      );
    });

    test('should fail when compared to null', () => {
      fc.assert(
        fc.property(arbitrary, (a: any) => {
          return deepEquals(a, null) === false;
        }),
      );
    });

    test('should fail for different sized arrays', () => {
      expect(deepEquals([1], [1, 2])).toBe(false);
    });
    test('should fail for different arrays', () => {
      expect(deepEquals([1], [2])).toBe(false);
    });
    test('should fail for different sized objects', () => {
      expect(deepEquals({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });
    test('should fail for different values', () => {
      expect(deepEquals({ a: 1 }, { a: 2 })).toBe(false);
    });
    test('should fail for different keys', () => {
      expect(deepEquals({ a: 1 }, { b: 1 })).toBe(false);
    });
    test('should fail for different dates', () => {
      expect(deepEquals(new Date(), new Date(0))).toBe(false);
    });
  });
});
