// @vitest-environment node
import { expect, describe, it } from 'vitest';
import {
  getActiveRows,
  calculatePageRange,
  buildPaginationInfo,
  sortRows,
  initializeSortQueries,
  updateSortQueries,
} from '../../src/lib/utils';
import type {
  PaginationInterface,
  SortQueryInterface,
  TableColumnInterface,
} from '../../src/lib/types';

describe('getActiveRows', () => {
  it('should return empty array when input is empty', () => {
    const paginator: PaginationInterface = {
      enabled: true,
      page: 1,
      pageSize: 10,
      start: 1,
      end: 1,
      totalPages: 1,
      visibleBtns: 5,
      pageSizeOptions: [10, 20, 50],
    };

    expect(getActiveRows([], paginator)).toEqual([]);
  });

  it('should return the correct slice of rows', () => {
    const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const paginator: PaginationInterface = {
      enabled: true,
      page: 2,
      pageSize: 5,
      start: 1,
      end: 3,
      totalPages: 3,
      visibleBtns: 5,
      pageSizeOptions: [5, 10, 20],
    };

    expect(getActiveRows(rows, paginator)).toEqual([6, 7, 8, 9, 10]);
  });
});

describe('calculatePageRange', () => {
  it('should handle when total pages is less than visibleBtns', () => {
    const paginator: PaginationInterface = {
      enabled: true,
      page: 1,
      pageSize: 10,
      start: 1,
      end: 1,
      totalPages: 3,
      visibleBtns: 5,
      pageSizeOptions: [10, 20, 50],
    };

    const result = calculatePageRange(paginator, 25, [1, 2, 3]);

    expect(result.start).toBe(1);
    expect(result.end).toBe(3);
    expect(result.totalPages).toBe(3);
  });
});

describe('buildPaginationInfo', () => {
  it('should return no data message when rows are empty', () => {
    const paginator: PaginationInterface = {
      enabled: true,
      page: 1,
      pageSize: 10,
      start: 1,
      end: 1,
      totalPages: 0,
      visibleBtns: 5,
      pageSizeOptions: [10, 20, 50],
    };

    expect(buildPaginationInfo(paginator, 0)).toBe('No data available');
  });

  it('should show correct range for first page', () => {
    const paginator: PaginationInterface = {
      enabled: true,
      page: 1,
      pageSize: 10,
      start: 1,
      end: 1,
      totalPages: 3,
      visibleBtns: 5,
      pageSizeOptions: [10, 20, 50],
    };

    expect(buildPaginationInfo(paginator, 25)).toBe(
      'Showing 1 to 10 of 25 entries'
    );
  });

  it('should handle last page with fewer items', () => {
    const paginator: PaginationInterface = {
      enabled: true,
      page: 3,
      pageSize: 10,
      start: 1,
      end: 3,
      totalPages: 3,
      visibleBtns: 5,
      pageSizeOptions: [10, 20, 50],
    };

    expect(buildPaginationInfo(paginator, 25)).toBe(
      'Showing 21 to 25 of 25 entries'
    );
  });
});

describe('sortRows', () => {
  const rows = [
    { id: 3, name: 'Charlie', age: 35 },
    { id: 1, name: 'Alice', age: 25 },
    { id: 2, name: 'Bob', age: 30 },
  ];

  const nameColumn: TableColumnInterface = {
    label: 'Name',
    path: 'name',
    sortable: true,
  };

  it('should return original rows when query is empty', () => {
    expect(sortRows(rows, [])).toEqual(rows);
  });

  it('should sort by a single column ascending', () => {
    const query: SortQueryInterface[] = [{ column: nameColumn, order: 'asc' }];
    const sorted = sortRows(rows, query);
    expect(sorted[0].name).toBe('Alice');
    expect(sorted[1].name).toBe('Bob');
    expect(sorted[2].name).toBe('Charlie');
  });

  it('should sort by a single column descending', () => {
    const query: SortQueryInterface[] = [{ column: nameColumn, order: 'desc' }];
    const sorted = sortRows(rows, query);
    expect(sorted[0].name).toBe('Charlie');
    expect(sorted[1].name).toBe('Bob');
    expect(sorted[2].name).toBe('Alice');
  });

  it('should use preSort function when provided', () => {
    const customColumn: TableColumnInterface = {
      label: 'Name Length',
      path: 'name',
      preSort: value => value.length,
    };

    const query: SortQueryInterface[] = [
      { column: customColumn, order: 'asc' },
    ];
    const sorted = sortRows(rows, query);
    // Bob (3) < Alice (5) < Charlie (7)
    expect(sorted[0].name).toBe('Bob');
    expect(sorted[1].name).toBe('Alice');
    expect(sorted[2].name).toBe('Charlie');
  });
});

describe('initializeSortQueries', () => {
  it('should return empty array when no columns have initialSort', () => {
    const columns: TableColumnInterface[] = [
      { label: 'Name', path: 'name' },
      { label: 'Age', path: 'age' },
    ];

    expect(initializeSortQueries(columns)).toEqual([]);
  });

  it('should create sort queries for columns with initialSort', () => {
    const columns: TableColumnInterface[] = [
      {
        label: 'Name',
        path: 'name',
        initialSort: true,
        initialSortOrder: 'asc',
      },
      { label: 'Age', path: 'age' },
    ];

    const result = initializeSortQueries(columns);
    expect(result.length).toBe(1);
    expect(result[0].column.path).toBe('name');
    expect(result[0].order).toBe('asc');
  });

  it('should default to asc order when initialSortOrder is not specified', () => {
    const columns: TableColumnInterface[] = [
      { label: 'Name', path: 'name', initialSort: true },
    ];

    const result = initializeSortQueries(columns);
    expect(result[0].order).toBe('asc');
  });
});

describe('updateSortQueries', () => {
  const nameColumn: TableColumnInterface = { label: 'Name', path: 'name' };
  const ageColumn: TableColumnInterface = { label: 'Age', path: 'age' };

  it('should toggle order when column already exists in queries', () => {
    const queries: SortQueryInterface[] = [
      { column: nameColumn, order: 'asc' },
    ];
    const result = updateSortQueries(queries, nameColumn);

    expect(result.length).toBe(1);
    expect(result[0].column).toBe(nameColumn);
    expect(result[0].order).toBe('desc');
  });

  it('should add new column with asc order when not in queries', () => {
    const queries: SortQueryInterface[] = [
      { column: nameColumn, order: 'asc' },
    ];
    const result = updateSortQueries(queries, ageColumn);

    expect(result.length).toBe(1); // Replaces existing sorts
    expect(result[0].column).toBe(ageColumn);
    expect(result[0].order).toBe('asc');
  });
});
