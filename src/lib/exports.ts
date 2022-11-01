import { TableColumnInterface } from './types';
import { get } from 'lodash';

function sanitize(str: string) {
  try {
    return str.replace(/<(?:.|\n)*?>/gm, " ")
      .replace(/\n/g, " ")
      .replace(/\t/g, " ")
      .replace(/\s{2,}/g, " ")
      .replace(/=/g, " ")
      .replace(/,/g, " ")
      .trim();
  } catch (error) {
    return str;
  }
}

export function convertToCsv(columns: TableColumnInterface[], rows: any[], period = {} as any) {
  let str = columns.filter((column) => column.exportable !== false)
    .map((column) => column.label)
    .join(",");

  str += "\n";
  str += rows.map((row) => columns
    .filter(column => column.exportable !== false)
    .map(column => {
      let value = typeof column.path === 'function' 
        ? column.path(row)
        : get(row, column.path);
      if (typeof column.formatter === 'function' && value) value = column.formatter(value)
      return sanitize(column.drillable && Array.isArray(value) ? value.length : value);
    })
    .join(",")
  ).join("\n");

  str += "\n" + `Date Created:  ${new Date()}`;

  return str;
}

export function exportToCSV(csvContent: string, filename: string) {
  const csvData = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(csvData);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
