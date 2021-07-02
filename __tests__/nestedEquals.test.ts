import fc, { Arbitrary } from 'fast-check';
import { deepEquals } from '../src';
import { deepCopy } from '../src/index';

const EachSimpleType = [
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
      fc.property(fc.object({ maxDepth: 5, values: [fc.string(), fc.integer(), fc.double(), fc.date()] }), (obj) => {
        return deepEquals(obj, deepCopy(obj));
      }),
    );
  });
});
