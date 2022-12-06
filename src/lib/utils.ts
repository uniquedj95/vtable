import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import orderBy from "lodash/orderBy";
import { SortQueryInterface } from "./types";

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