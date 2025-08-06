import {
  PaginationInterface,
  SortQueryInterface,
  TableColumnInterface,
  ChipConfig,
  BadgeConfig,
  StatusConfig,
} from './types';
import { h } from 'vue';
import { IonBadge, IonChip, IonLabel } from '@ionic/vue';

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
 * Creates an array of numbers within a specified range.
 *
 * @param start - The start number.
 * @param end - The end number (exclusive).
 * @returns An array of numbers.
 */
export function range(start: number, end: number): number[] {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
}

/**
 * Detects if a string contains HTML content.
 *
 * @param str - The string to check for HTML content.
 * @returns True if the string contains HTML tags, false otherwise.
 */
export function isHtmlString(str: any): boolean {
  if (typeof str !== 'string') return false;

  // More robust pattern to match valid HTML tags
  const htmlPattern = /<\/?[a-z][\s\S]*>/i;
  return htmlPattern.test(str);
}

/**
 * Sanitizes HTML content by removing dangerous elements and attributes.
 * This helps prevent XSS attacks while preserving safe formatting.
 *
 * @param html - The HTML string to sanitize.
 * @returns The sanitized HTML string.
 */
export function sanitizeHtml(html: string): string {
  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Remove potentially dangerous elements and attributes
  const dangerousElements = ['script', 'iframe', 'object', 'embed', 'form'];
  const dangerousAttributes = [
    'onload',
    'onerror',
    'onclick',
    'onmouseover',
    'onfocus',
    'onblur',
  ];

  // Remove dangerous elements
  dangerousElements.forEach(tagName => {
    const elements = temp.querySelectorAll(tagName);
    elements.forEach(el => el.remove());
  });

  // Remove dangerous attributes from all elements
  const allElements = temp.querySelectorAll('*');
  allElements.forEach(el => {
    dangerousAttributes.forEach(attr => {
      if (el.hasAttribute(attr)) {
        el.removeAttribute(attr);
      }
    });

    // Remove any attribute that starts with 'on' (event handlers)
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.toLowerCase().startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return temp.innerHTML;
}

/**
 * Renders a value as a chip component
 */
export const renderChip = (
  value: any,
  config: ChipConfig = {},
  onClick?: () => void
) => {
  return h(
    IonChip,
    {
      color: config.color || 'primary',
      outline: config.outline || false,
      onClick,
    },
    [h(IonLabel, value)]
  );
};

/**
 * Renders a value as a badge component
 */
export const renderBadge = (value: any, config: BadgeConfig = {}) => {
  return h(
    IonBadge,
    {
      color: config.color || 'primary',
      size: config.size || 'default',
    },
    value
  );
};

/**
 * Renders status values with predefined colors and styles
 */
export const renderStatus = (
  value: any,
  statusConfig: StatusConfig,
  defaultConfig: ChipConfig = {}
) => {
  const config = statusConfig[value] || defaultConfig;
  return renderChip(config.label || value, {
    color: config.color,
    outline: config.outline,
  });
};

/**
 * Renders a list of values as chips
 */
export const renderChipList = (
  values: any[],
  config: ChipConfig = {},
  maxVisible: number = 3
) => {
  if (!Array.isArray(values)) return values;

  const visibleValues = values.slice(0, maxVisible);
  const remainingCount = values.length - maxVisible;

  const chips = visibleValues.map((value, _index) => renderChip(value, config));

  if (remainingCount > 0) {
    chips.push(
      renderChip(`+${remainingCount}`, {
        ...config,
        color: 'medium',
        outline: true,
      })
    );
  }

  return h(
    'div',
    { style: 'display: flex; flex-wrap: wrap; gap: 4px;' },
    chips
  );
};

/**
 * Renders HTML content safely with sanitization
 * Note: Only use with trusted content or content that has been validated
 */
export const renderHtml = (htmlContent: string) => {
  const sanitizedContent = sanitizeHtml(htmlContent);
  return h('div', {
    innerHTML: sanitizedContent,
  });
};

/**
 * Renders a progress bar
 */
export const renderProgress = (
  value: number,
  max: number = 100,
  color: string = 'primary'
) => {
  const percentage = Math.min((value / max) * 100, 100);
  return h(
    'div',
    {
      style: {
        width: '100%',
        height: '8px',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden',
      },
    },
    [
      h('div', {
        style: {
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: `var(--ion-color-${color})`,
          transition: 'width 0.3s ease',
        },
      }),
    ]
  );
};

/**
 * Renders a boolean value as a colored indicator
 */
export const renderBoolean = (
  value: boolean,
  trueConfig: { color: string; label: string } = {
    color: 'success',
    label: 'Yes',
  },
  falseConfig: { color: string; label: string } = {
    color: 'danger',
    label: 'No',
  }
) => {
  const config = value ? trueConfig : falseConfig;
  return renderBadge(config.label, { color: config.color });
};
