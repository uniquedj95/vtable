import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import orderBy from "lodash/orderBy";
import { PaginationInterface, SortQueryInterface, TableColumnInterface } from "./types";

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