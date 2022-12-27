import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import orderBy from "lodash/orderBy";
import { PaginationInterface, SortQueryInterface } from "./types";

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
      if(!value || isEmpty(value)) return ""
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
export function buildPaginationInfo (paginator: PaginationInterface, totalRows?: number): string {
  const { page, pageSize, totalPages} = paginator;
  return totalRows 
    ? `Showing ${(page * pageSize) - (pageSize - 1)} to ${(page === totalPages) ? totalRows : page * pageSize} of ${totalRows} entries`
    : "No data available"
}