export interface Option {
  label: string;
  value: string | number;
  other?: any;
  isChecked?: boolean;
  disabled?: boolean;
  description?: string;
}

export interface TableColumnInterface {
  label: string;
  path: string;
  exportable?: boolean;
  initialSort?: boolean;
  sortable?: boolean;
  initialSortOrder?: sortType;
  sortCaseSensitive?: boolean;
  drillable?: boolean;
  preSort?: (value: any) => any;
  formatter?: (value: any, row: any) => any;
  thStyles?: Record<string, string>;
  thClasses?: Array<string>;
  tdStyles?: Record<string, string>;
  tdClasses?: Array<string>;
}

export interface SortQueryInterface {
  column: TableColumnInterface;
  order: sortType;
}

export type sortType = "asc" | "desc" | "none";

export interface PaginationInterface {
  enabled: boolean;
  page: number;
  pageSize: number;
  start: number;
  end: number;
  totalPages: number;
  visibleBtns: number;
  pageSizeOptions: number[];
}
export interface TableFilterInterface {
  pagination: PaginationInterface;
  search: string;
  sort: SortQueryInterface[];
}

export interface ActionButtonInterface {
  label: string;
  icon?: string;
  action: (activeRows: any[], allRows: any[], filters: TableFilterInterface, columns: TableColumnInterface[]) => any;
  color?: string;
}

export interface RowActionButtonInterface {
  label?: string;
  icon?: string;
  action: (row: any, index: number) => any;
  color?: string;
  default?: boolean;
  condition?: (row: any) => boolean;
}

export type TextFieldTypes = "text" | "number" | "date";

export interface CustomFilterInterface {
  id: string;
  label?: string;
  value?: any;
  gridSize?: number; // numbers between 1 and 12
  type: TextFieldTypes | "select" | "dateRange"
  options?: Option[];
  placeholder?: string;
  required?: boolean;
  multiple?: boolean;
  onUpdate?: (value: any) => any,
  slotName?: string
}

export interface TableConfigInterface {
  showSubmitButton?: boolean;
  showSearchField?: boolean;
  showIndices?: boolean;
  pagination?: Partial<PaginationInterface>
}

export interface TableGlobalConfig {
  color: "primary" | "secondary" | "tertiary" | "success" | "warning" | "danger" | "light" | "dark" | "medium" | "custom"
}

export interface PaginationButton {
  onClick?: () => void;
  icon?: string;
  label?: string | number;
  disabled?: boolean
}