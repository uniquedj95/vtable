import dayjs from 'dayjs';
import { TableColumnInterface } from './types';
import { get, isEmpty } from 'lodash';
import { Service } from '@/services/service';

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
      const value = get(row, column.path);
      return sanitize(column.drillable && Array.isArray(value) ? value.length : value);
    })
    .join(",")
  ).join("\n");

  str += "\n" + `Date Created:  ${dayjs().format("YYYY-MM-DD:h:m:s")}`;
  if (!isEmpty(period)) {
    str += "\n" + `Quarter: ${period.startDate} to ${period.endDate}`;
  }
  str += "\n" + `e-Mastercard Version : ${Service.getAppVersion()}`;
  str += "\n" + `API Version ${Service.getApiVersion()}`;
  str += "\n" + `Site UUID: ${Service.getSiteUUID()}`;

  return str;
}

export function exportToCSV(csvContent: string, filename: string) {
  const csvData = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  //IE11 & Edge
  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(csvData, filename);
  } else {
    //In FF link must be added to DOM to be clicked
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(csvData);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
