export function deepEquals<T>(o: T, u: unknown): u is T {
  return o === u;
}

const reviver = (key: string, value: unknown) => {
  if (typeof value === 'string') {
    const dateStringMatch = /^Date\((.+)\)$/.exec(value);
    // console.log('dateStringMatch', dateStringMatch, '0', value);
    if (dateStringMatch) {
      return new Date(dateStringMatch[1]);
    }
  }
  return value;
};

export function deepCopy<T>(o: T): T {
  let firstCalled = true;
  const dateFormatter = function (this: any, name: string, value: unknown) {
    if (firstCalled) {
      // it is first called with the entire object and name = ''
      // console.log(this, name, this[name], this[name] instanceof Date);
      if (this[name] instanceof Date) {
        return `Date(${this[name].toISOString()})`;
      }
      firstCalled = false;
    }
    const property = this[name];
    if (property instanceof Date) {
      return `Date(${property.toISOString()})`;
    }
    return value;
  };
  const stringified = JSON.stringify(o, dateFormatter);
  const parsed = JSON.parse(stringified, reviver);
  return parsed;
}