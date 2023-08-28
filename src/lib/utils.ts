import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import orderBy from "lodash/orderBy";
import { PaginationInterface, SortQueryInterface, TableColumnInterface } from "./types";

/**
 * A function that retrieves an array of rows asynchronously.
 * 
 * @returns {Promise<Array<any>>} A promise resolving to an array of rows.
 */
type RowsGetter = () => Promise<Array<any>>;

/**
 * Retrieves an array of rows either from a getter function or the provided default rows.
 *
 * @param {RowsGetter} getter - An optional function to retrieve rows asynchronously.
 * @param {Array<any>} defaultRows - An array of default rows (empty by default).
 * @param {boolean} indexed - If true, adds an 'index' property to each row.
 * @returns {Promise<Array<any>>} An array of rows.
 */
export async function getRows(getter?: RowsGetter, defaultRows: Array<any> = [], indexed: boolean = false): Promise<Array<any>> {
  if (typeof getter === 'function') defaultRows = await getter();
  return indexed ? defaultRows.map((r: any, i: number) => ({...r, index: i + 1})) : defaultRows;
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
    rows,
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
 * Initializes sort queries based on column configurations.
 *
 * @param {Array<TableColumnInterface>} columns - An array of table columns.
 * @returns {Array<SortQueryInterface>} An array of initial sort queries.
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
 * @param {Array<SortQueryInterface>} sortQueries - The current array of sort queries.
 * @param {TableColumnInterface} column - The column for which to update the sort query.
 * @returns {Array<SortQueryInterface>} The updated array of sort queries.
 */
export function updateSortQueries (sortQueries: Array<SortQueryInterface>, column: TableColumnInterface): Array<SortQueryInterface> {
  const i = sortQueries.findIndex(q => q.column.path === column.path);
  if (i >= 0) sortQueries[i].order = sortQueries[i].order === 'asc' ? 'desc' : 'asc';
  else sortQueries = [{ column, order: 'asc' }]
  return sortQueries;
}