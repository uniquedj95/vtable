import {
  PaginationInterface,
  SortQueryInterface,
  TableColumnInterface,
} from './types';

/**
 * Safely gets the value at path of object.
 *
 * @param obj - The object to query.
 * @param path - The path of the property to get.
 * @returns The resolved value.
 */
export function get(obj: any, path: string): any {
  if (obj == null) return undefined;

  // Handle both dot notation and array indexing
  const pathArray = path.replace(/\[(\w+)\]/g, '.$1').split('.');
  let result = obj;

  for (const key of pathArray) {
    if (result == null) return undefined;
    result = result[key];
  }

  return result;
}

/**
 * Checks if value is an empty object, collection, or string.
 * @param value - The value to check.
 * @returns Returns true if value is empty, else false.
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true;

  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  return false;
}

/**
 * A function that retrieves an array of rows asynchronously.
 *
 * @returns A promise resolving to an array of rows.
 */
type RowsGetter = () => Promise<Array<any>>;

/**
 * Retrieves an array of rows either from a getter function or the provided default rows.
 *
 * @param getter - An optional function to retrieve rows asynchronously.
 * @param defaultRows - An array of default rows (empty by default).
 * @param indexed - If true, adds an 'index' property to each row.
 * @returns An array of rows.
 */
export async function getRows(
  defaultRows: Array<any>,
  indexed = false,
  getter?: RowsGetter
): Promise<Array<any>> {
  let rows = defaultRows;
  if (typeof getter === 'function') rows = await getter();
  return indexed
    ? rows.map((r: any, i: number) => ({ ...r, index: i + 1 }))
    : rows;
}

/**
 * Creates an array of elements, sorted in ascending/descending order by the results of running
 * each element through each iteratee.
 *
 * @param collection - The collection to iterate over.
 * @param iteratees - The iteratees to sort by.
 * @param orders - The sort orders of iteratees.
 * @returns Returns the new sorted array.
 */
export function orderBy(
  collection: any[],
  iteratees: ((item: any) => any)[],
  orders: string[]
): any[] {
  if (!Array.isArray(collection)) return [];
  if (collection.length <= 1) return [...collection];

  return [...collection].sort((a, b) => {
    for (let i = 0; i < iteratees.length; i++) {
      const iteratee = iteratees[i];
      const order = orders[i];

      const valueA = iteratee(a);
      const valueB = iteratee(b);

      if (valueA === valueB) continue;

      if (order === 'asc') {
        return valueA < valueB ? -1 : 1;
      } else {
        return valueA > valueB ? -1 : 1;
      }
    }

    return 0;
  });
}

/**
 * A function that sort table rows based on specified sort queries
 *
 * @param rows An array of data
 * @param query an array of sort queries
 * @returns sorted array
 */
export function sortRows(rows: any[], query: SortQueryInterface[]): any[] {
  if (isEmpty(query)) return rows;
  const orders = query.map(({ order }) => order);
  const iteratees = query.map(({ column }) => (row: any) => {
    let value = get(row, column.path);
    if (isEmpty(value)) return '';
    if (typeof column.preSort === 'function') value = column.preSort(value);
    if (typeof value === 'number' || column.sortCaseSensitive) return value;
    return value.toString().toLowerCase();
  });

  return orderBy(rows.slice(), iteratees, orders);
}

/**
 * Builds pagination information summary
 *
 * @param paginator The current pagination filter
 * @param totalRows Total filtered rows
 * @returns string
 */
export function buildPaginationInfo(
  paginator: PaginationInterface,
  totalRows: number
): string {
  const { page, pageSize, totalPages } = paginator;
  const from = page * pageSize - (pageSize - 1);
  const to = page === totalPages ? totalRows : page * pageSize;
  return totalRows
    ? `Showing ${from} to ${to} of ${totalRows} entries`
    : 'No data available';
}

/**
 * Calculates the range of visible page numbers for pagination.
 *
 * @param paginator - The pagination settings.
 * @param totalRows - The total number of rows.
 * @param pages - An array of current visible page numbers.
 * @returns The updated pagination settings.
 */
export function calculatePageRange(
  paginator: PaginationInterface,
  totalRows: number,
  pages: Array<number>
): PaginationInterface {
  // Calculate the total number of pages
  paginator.totalPages = Math.ceil(totalRows / paginator.pageSize);

  // If total pages are within visibleBtns, show all pages
  if (paginator.totalPages <= paginator.visibleBtns) {
    paginator.start = 1;
    paginator.end = paginator.totalPages;
    return paginator;
  }

  // Return if start and end page numbers are already visible
  if (
    (pages.includes(paginator.page - 1) || paginator.page === 1) &&
    (pages.includes(paginator.page + 1) ||
      paginator.page === paginator.totalPages)
  ) {
    return paginator;
  }

  // Calculate the range of visible page numbers
  paginator.start = paginator.page === 1 ? 1 : paginator.page - 1;
  paginator.end = paginator.start + paginator.visibleBtns - 5;

  // Adjust start and end if they go out of bounds
  if (paginator.start <= 3) {
    paginator.end += 3 - paginator.start;
    paginator.start = 1;
  }

  if (paginator.end >= paginator.totalPages - 2) {
    paginator.start -= paginator.end - (paginator.totalPages - 2);
    paginator.end = paginator.totalPages;
  }

  // Ensure start is within valid range
  paginator.start = Math.max(paginator.start, 1);
  return paginator;
}

/**
 * Paginates an array of rows based on the provided pagination settings.
 *
 * @param rows - The array of rows to be paginated.
 * @param paginator - The pagination settings.
 * @returns The paginated array of rows.
 */
export function getActiveRows(
  rows: Array<any>,
  paginator: PaginationInterface
): Array<any> {
  if (isEmpty(rows)) return rows;
  const { page, pageSize } = paginator;
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

/**
 * Initializes sort queries based on column configurations.
 *
 * @param columns - An array of table columns.
 * @returns An array of initial sort queries.
 */
export function initializeSortQueries(
  columns: Array<TableColumnInterface>
): Array<SortQueryInterface> {
  return columns.reduce(
    (acc: Array<SortQueryInterface>, column: TableColumnInterface) => {
      if (column.initialSort)
        acc.push({ column, order: column.initialSortOrder || 'asc' });
      return acc;
    },
    []
  );
}

/**
 * Updates the array of sort queries based on a specific column.
 *
 * @param sortQueries - The current array of sort queries.
 * @param column - The column for which to update the sort query.
 * @returns The updated array of sort queries.
 */
export function updateSortQueries(
  sortQueries: Array<SortQueryInterface>,
  column: TableColumnInterface
): Array<SortQueryInterface> {
  const i = sortQueries.findIndex(q => q.column.path === column.path);
  if (i >= 0)
    sortQueries[i].order = sortQueries[i].order === 'asc' ? 'desc' : 'asc';
  else sortQueries = [{ column, order: 'asc' }];
  return sortQueries;
}

/**
 * Filters an array of rows based on a query string.
 *
 * @param  rows - The array of rows to be filtered.
 * @param query - The query string for filtering.
 * @returns The filtered array of rows.
 */
export function filterRows(rows: Array<any>, query: string): Array<any> {
  if (!query || isEmpty(rows)) return rows;
  return rows
    .slice()
    .filter(row =>
      Object.values(row).some(
        v => v && JSON.stringify(v).toLowerCase().includes(query.toLowerCase())
      )
    );
}

/**
 * Determines if a table column is drillable based on the provided column configuration, value, and row.
 *
 * @param column - The table column configuration object.
 * @param value - The value in the table cell.
 * @param row - The entire row data.
 * @returns A boolean indicating whether the column is drillable.
 */
export function isDrillable(
  column: TableColumnInterface,
  value: any,
  row: any
): boolean {
  return typeof column.drillable === 'function'
    ? column.drillable(value, row)
    : !!column.drillable && !isEmpty(value);
}

/**
 * Creates an array of numbers progressing from start up to, but not including, end.
 *
 * @param start - The start of the range.
 * @param end - The end of the range.
 * @returns An array of numbers.
 */
export function range(start: number, end: number): number[] {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
}
