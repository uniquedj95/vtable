import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import orderBy from "lodash/orderBy";
import { PaginationInterface, SortQueryInterface, TableColumnInterface } from "./types";

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
export async function getRows(defaultRows: Array<any>, indexed = false, getter?: Function): Promise<Array<any>> {
  let rows = defaultRows;
  if (typeof getter === 'function') rows = await getter();
  return indexed ? rows.map((r: any, i: number) => ({...r, index: i + 1})) : rows;
}

/**
 * A function that sort table rows based on specified sort queries
 * 
 * @param rows An array of data
 * @param query an array of sort queries
 * @returns sorted array
 */
export function sortRows(rows: any[], query: SortQueryInterface[]) {
  if (isEmpty(query)) return rows;
  const orders = query.map(({ order }) => order);
  return orderBy(
    rows.slice(),
    query.map(({ column }) => (row) => {
      let value = get(row, column.path);
      if (!value || isEmpty(value)) return ""
      if (typeof column.preSort === "function") value = column.preSort(value);
      if (typeof value === "number" || column.sortCaseSensitive) return value;
      return value.toString().toLowerCase();
    }),
    orders as any
  );
};

/**
 * Builds pagination information summary
 * 
 * @param paginator The current pagination filter
 * @param totalRows Total filtered rows
 * @returns string
 */
export function buildPaginationInfo(paginator: PaginationInterface, totalRows: number): string {
  const { page, pageSize, totalPages } = paginator;
  const from = (page * pageSize) - (pageSize - 1);
  const to = (page === totalPages) ? totalRows : page * pageSize;
  return totalRows
    ? `Showing ${from} to ${to} of ${totalRows} entries`
    : "No data available"
}

/**
 * Calculates the range of visible page numbers for pagination.
 *
 * @param paginator - The pagination settings.
 * @param totalRows - The total number of rows.
 * @param pages - An array of current visible page numbers.
 * @returns The updated pagination settings.
 */
export function calculatePageRange(paginator: PaginationInterface, totalRows: number, pages: Array<number>): PaginationInterface {
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
    (pages.includes(paginator.page + 1) || paginator.page === paginator.totalPages)
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
export function getActiveRows(rows: Array<any>, paginator: PaginationInterface): Array<any> {
  if(isEmpty(rows)) return rows;
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
export function initializeSortQueries (columns: Array<TableColumnInterface>): Array<SortQueryInterface> {
  return columns.reduce((acc: Array<SortQueryInterface>, column: TableColumnInterface) => {
    if(column.initialSort) acc.push({ column, order: column.initialSortOrder || "asc" });
    return acc;
  }, [])
}

/**
 * Updates the array of sort queries based on a specific column.
 *
 * @param sortQueries - The current array of sort queries.
 * @param column - The column for which to update the sort query.
 * @returns The updated array of sort queries.
 */
export function updateSortQueries (sortQueries: Array<SortQueryInterface>, column: TableColumnInterface): Array<SortQueryInterface> {
  const i = sortQueries.findIndex(q => q.column.path === column.path);
  if (i >= 0) sortQueries[i].order = sortQueries[i].order === 'asc' ? 'desc' : 'asc';
  else sortQueries = [{ column, order: 'asc' }]
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
  return rows.slice().filter(row => 
    Object.values(row).some(v => 
      v && JSON.stringify(v).toLowerCase().includes(query.toLowerCase())
    )
  );
}