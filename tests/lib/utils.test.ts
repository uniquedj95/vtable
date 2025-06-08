// @vitest-environment node
import { expect, describe, it } from 'vitest';
import {
  get,
  isEmpty,
  orderBy,
  range,
  filterRows,
  isDrillable,
} from '../../src/lib/utils';

// Tests for get function
describe('get', () => {
  it('should return undefined for null objects', () => {
    expect(get(null, 'a.b')).toBeUndefined();
    expect(get(undefined, 'a.b')).toBeUndefined();
  });

  it('should get value from simple objects using dot notation', () => {
    const obj = { a: { b: 'c' } };
    expect(get(obj, 'a.b')).toBe('c');
  });

  it('should get value from arrays using bracket notation', () => {
    const obj = { a: { b: [{ c: 'd' }] } };
    expect(get(obj, 'a.b[0].c')).toBe('d');
  });

  it('should return undefined for non-existent paths', () => {
    const obj = { a: { b: 'c' } };
    expect(get(obj, 'a.d')).toBeUndefined();
    expect(get(obj, 'x.y.z')).toBeUndefined();
  });

  it('should handle arrays correctly', () => {
    const obj = { users: [{ name: 'John' }, { name: 'Jane' }] };
    expect(get(obj, 'users[1].name')).toBe('Jane');
  });

  it('should handle complex paths', () => {
    const obj = {
      data: { patients: [{ name: { first: 'John', last: 'Doe' } }] },
    };
    expect(get(obj, 'data.patients[0].name.first')).toBe('John');
  });
});

describe('isEmpty', () => {
  it('should return true for null or undefined', () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });

  it('should return true for empty strings', () => {
    expect(isEmpty('')).toBe(true);
  });

  it('should return true for empty arrays', () => {
    expect(isEmpty([])).toBe(true);
  });

  it('should return true for empty objects', () => {
    expect(isEmpty({})).toBe(true);
  });

  it('should return false for non-empty strings', () => {
    expect(isEmpty('hello')).toBe(false);
  });

  it('should return false for non-empty arrays', () => {
    expect(isEmpty([1, 2, 3])).toBe(false);
  });

  it('should return false for non-empty objects', () => {
    expect(isEmpty({ a: 1 })).toBe(false);
  });

  it('should return false for numbers', () => {
    expect(isEmpty(0)).toBe(false);
    expect(isEmpty(42)).toBe(false);
  });

  it('should return false for booleans', () => {
    expect(isEmpty(false)).toBe(false);
    expect(isEmpty(true)).toBe(false);
  });
});

describe('orderBy', () => {
  it('should handle empty arrays', () => {
    expect(orderBy([], [], [])).toEqual([]);
  });

  it('should sort arrays with single iteratee and order', () => {
    const collection = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ];
    const result = orderBy(collection, [item => item.age], ['asc']);
    expect(result[0].name).toBe('Jane');
    expect(result[1].name).toBe('John');
  });

  it('should sort in descending order', () => {
    const collection = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ];
    const result = orderBy(collection, [item => item.age], ['desc']);
    expect(result[0].name).toBe('John');
    expect(result[1].name).toBe('Jane');
  });

  it('should handle multiple iteratees and orders', () => {
    const collection = [
      { name: 'John', age: 30, role: 'admin' },
      { name: 'Jane', age: 25, role: 'admin' },
      { name: 'Bob', age: 30, role: 'user' },
    ];
    const result = orderBy(
      collection,
      [item => item.age, item => item.name],
      ['desc', 'asc']
    );
    expect(result[0].name).toBe('Bob');
    expect(result[1].name).toBe('John');
    expect(result[2].name).toBe('Jane');
  });

  it('should not mutate the original array', () => {
    const original = [{ value: 3 }, { value: 1 }, { value: 2 }];
    const originalCopy = [...original];
    orderBy(original, [item => item.value], ['asc']);
    expect(original).toEqual(originalCopy);
  });
});

describe('range', () => {
  it('should generate an array of numbers from start to end', () => {
    expect(range(1, 5)).toEqual([1, 2, 3, 4]);
  });

  it('should handle single number ranges', () => {
    expect(range(5, 6)).toEqual([5]);
  });

  it('should return an empty array when start equals end', () => {
    expect(range(1, 1)).toEqual([]);
  });

  it('should return an empty array when start is greater than end', () => {
    expect(range(5, 1)).toEqual([]);
  });
});

describe('filterRows', () => {
  const rows = [
    { id: 1, name: 'John', email: 'john@example.com', roles: ['admin'] },
    { id: 2, name: 'Jane', email: 'jane@example.com', roles: ['user'] },
    { id: 3, name: 'Bob', email: 'bob@example.com', roles: ['editor'] },
  ];

  it('should return all rows when query is empty', () => {
    expect(filterRows(rows, '')).toEqual(rows);
  });

  it('should return empty array when rows is empty', () => {
    expect(filterRows([], 'test')).toEqual([]);
  });

  it('should filter rows by string property case-insensitively', () => {
    const result = filterRows(rows, 'john');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('should filter by substring match', () => {
    const result = filterRows(rows, '@example');
    expect(result).toHaveLength(3);
  });

  it('should filter by number values converted to string', () => {
    const result = filterRows(rows, '1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('should filter by array properties', () => {
    const result = filterRows(rows, 'admin');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('John');
  });

  it('should not mutate the original array', () => {
    const original = [...rows];
    filterRows(rows, 'john');
    expect(rows).toEqual(original);
  });
});

describe('isDrillable', () => {
  it('should return false when column.drillable is falsy', () => {
    const column = { label: 'Test', path: 'test', drillable: false };
    expect(isDrillable(column, 'value', {})).toBe(false);
  });

  it('should return false when value is empty', () => {
    const column = { label: 'Test', path: 'test', drillable: true };
    expect(isDrillable(column, '', {})).toBe(false);
    expect(isDrillable(column, null, {})).toBe(false);
    expect(isDrillable(column, undefined, {})).toBe(false);
  });

  it('should return true when column.drillable is truthy and value is not empty', () => {
    const column = { label: 'Test', path: 'test', drillable: true };
    expect(isDrillable(column, 'value', {})).toBe(true);
  });

  it("should call drillable function when it's a function", () => {
    const row = { id: 1 };
    const column = {
      label: 'Test',
      path: 'test',
      drillable: (value, rowData) => value === 'test' && rowData.id === 1,
    };
    expect(isDrillable(column, 'test', row)).toBe(true);
    expect(isDrillable(column, 'other', row)).toBe(false);
    expect(isDrillable(column, 'test', { id: 2 })).toBe(false);
  });
});
