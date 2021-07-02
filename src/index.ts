// see https://github.com/microsoft/TypeScript/issues/1897#issuecomment-331765301
export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export type JSONObject = { [member: string]: JSONValue };
export type JSONArray = Array<JSONValue>;

export type JSONParseable = JSONObject | JSONArray | JSONPrimitive | Date;

/**
 *
 * @param o
 * @param u
 */
export async function asyncDeepEquals(o: JSONParseable, u: JSONParseable): Promise<boolean> {
  if (typeof o !== typeof u) {
    return false;
  } else if (isJSONObject(o) && isJSONObject(u)) {
    return isTwoObjectsEqual(o, u);
  } else if (isJSONArray(o) && isJSONArray(u)) {
    return isTwoArraysEqual(o, u);
  } else if (isDate(o) && isDate(u)) {
    return isTwoDateEqual(o, u);
  }

  return o === u;
}

const isDate = (value: any): value is Date => {
  return value instanceof Date;
};

const isJSONObject = (value: any): value is JSONObject => {
  return typeof value === 'object' && value !== null && !(value instanceof Date);
};

const isJSONArray = (value: any): value is JSONArray => {
  return Array.isArray(value);
};

const isTwoDateEqual = (date1: Date, date2: Date): boolean => {
  return date1.getTime() === date2.getTime();
};

const isTwoObjectsEqual = (obj1: JSONObject, obj2: JSONObject): boolean => {
  let result = true;
  const obj1Keys = Object.keys(obj1);
  const obj2Keys = Object.keys(obj2);

  if (!isTwoArraysEqual(obj1Keys, obj2Keys)) {
    result = false;
    return result;
  }

  for (let i = 0; i < obj1Keys.length; i++) {
    const key = obj1Keys[i];
    const value1 = obj1[key];
    const value2 = obj2[key];
    if (typeof value1 !== typeof value2) {
      result = false;
    } else if (isJSONArray(value1) && isJSONArray(value2)) {
      result = isTwoArraysEqual(value1, value2);
    } else if (isJSONObject(value1) && isJSONObject(value2)) {
      result = isTwoObjectsEqual(value1, value2);
    } else if (isDate(value1) && isDate(value2)) {
      result = isTwoDateEqual(value1, value2);
    } else {
      result = value1 === value2;
    }

    if (!result) return result;
  }
  return result;
};

const isTwoArraysEqual = (arr1: JSONArray, arr2: JSONArray): boolean => {
  let result = true;
  if (arr1.length !== arr2.length) {
    result = false;
    return result;
  }
  for (let i = 0; i < arr1.length; i++) {
    const value1 = arr1[i];
    const value2 = arr2[i];
    if (typeof value1 !== typeof value2) {
      result = false;
    } else if (isJSONObject(value1) && isJSONObject(value2)) {
      result = isTwoObjectsEqual(value1, value2);
    } else if (isJSONArray(value1) && isJSONArray(value2)) {
      result = isTwoArraysEqual(value1, value2);
    } else if (isDate(value1) && isDate(value2)) {
      result = isTwoDateEqual(value1, value2);
    } else {
      result = value1 === value2;
    }

    if (!result) return result;
  }
  return result;
};

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

export function deepCopy<T extends JSONParseable>(o: T): T {
  const dateFormatter = function (this: Record<string, JSONParseable>, name: string, value: unknown) {
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
