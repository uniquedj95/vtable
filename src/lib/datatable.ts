import { computed, defineComponent, h, onMounted, PropType, reactive, ref, watch } from "vue";
import { TableColumnInterface, TableFilterInterface, ActionButtonInterface, RowActionButtonInterface, CustomFilterInterface, TableConfigInterface, Option } from "./types";
import './datatable.css'
import get from 'lodash/get';
import isEmpty from "lodash/isEmpty";
import range from "lodash/range";
import { IonButton, IonCol, IonGrid, IonIcon, IonInput, IonItem, IonLabel, IonRow, IonSearchbar, IonSelect, IonSelectOption, IonSkeletonText } from "@ionic/vue";
import { arrowDown, arrowUp, swapVertical, caretBack, caretForward } from "ionicons/icons";
import { SelectInput } from "./select";
import { DateRangePicker } from "./date-picker";
import * as DT from "./utils";

export const DataTable = defineComponent({
  name: "DataTable",
  props: {
    rows: {
      type: Array as PropType<any[]>,
      default: () => []
    },
    asyncRows: {
      type: Function as PropType<() => Promise<any[]>>,
      required: false
    },
    columns: {
      type: Array as PropType<TableColumnInterface[]>,
      default: () => []
    },
    actionsButtons: {
      type: Array as PropType<ActionButtonInterface[]>,
      default: () => []
    },
    rowActionsButtons: {
      type: Array as PropType<RowActionButtonInterface[]>,
      default: () => []
    },
    customFilters: {
      type: Array as PropType<CustomFilterInterface[]>,
      default: () => []
    },
    color: {
      type: String as PropType<"primary" | "secondary" | "tertiary" | "success" | "warning" | "danger" | "light" | "dark" | "medium" | "custom">,
    },
    config: {
      type: Object as PropType<TableConfigInterface>,
      default: () => ({})
    }
  },
  emits: ["customFilter", "queryChange", "drilldown"],
  setup(props, { emit, slots }) {
    const isLoading = ref(false);
    const tableRows = ref<any[]>([]);
    const filteredRows = ref<any[]>([]);
    const activeRows = ref<any[]>([])
    const totalFilteredRows = computed(() => filteredRows.value.length);
    const totalColumns = computed(() => isEmpty(props.rowActionsButtons) ? tableColumns.value.length : tableColumns.value.length + 1);
    const tableColumns = computed<TableColumnInterface[]>(() => props.config.showIndices
      ? [{ path: "index", label: "#", initialSort: true, initialSortOrder: "asc" }, ...props.columns]
      : props.columns
    );

    const filters = reactive<TableFilterInterface>({
      search: "",
      sort: [],
      pagination: {
        enabled: true,
        page: 1,
        pageSize: 10,
        start: 1,
        end: 1,
        totalPages: 1,
        visibleBtns: 7,
        pageSizeOptions: [5, 10, 20, 50, 100]
      }
    });

    const showFilterSection = computed<boolean>(() => props.config.showSearchField !== false ||
      props.customFilters.length > 0 ||
      props.actionsButtons.length > 0
    )

    const customFiltersValues = reactive<Record<string, any>>(
      props.customFilters.reduce((acc, filter) => {
        acc[filter.id] = filter.value;
        return acc;
      }, {} as Record<string, any>)
    );

    const paginationPages = computed(() => filters.pagination.enabled
      ? range(filters.pagination.start, filters.pagination.end + 1)
      : []
    )

    const init = async () => {
      isLoading.value = true;
      tableRows.value = await DT.getRows(props.asyncRows, props.rows, props.config?.showIndices);
      filters.sort = DT.initializeSortQueries(tableColumns.value);
      isLoading.value = false;
    }

    
    watch(filters, () => {
      filteredRows.value = DT.sortRows(DT.filterRows(tableRows.value, filters.search), filters.sort);
      activeRows.value = DT.paginateRows(filteredRows.value, filters.pagination);
      DT.calculatePageRange(filters.pagination, totalFilteredRows.value, paginationPages.value);
    }, {
      immediate: true,
      deep: true
    });

    watch(customFiltersValues, () => props.config.showSubmitButton === false && emit("customFilter", customFiltersValues), {
      immediate: true,
      deep: true
    });
    
    watch(() => props.rows, () => init(), { deep: true, immediate: true });
    onMounted(async () => init());

    return () => [
      showFilterSection.value && h(IonGrid, { class: "ion-padding-vertical", style: { width: '100%', fontWeight: 500 } },
        h(IonRow, [
          h(IonCol, { size: '7' },
            h(IonRow, [
              props.config.showSearchField !== false && !isEmpty(tableRows.value) && h(IonCol, { size: '3', class: "ion-margin-bottom" },
                h(IonSearchbar, {
                  placeholder: 'Search here...',
                  class: 'box ion-no-padding',
                  value: filters.search,
                  onIonChange: (e: Event) => {
                    filters.search = (e.target as HTMLInputElement).value;
                    filters.pagination.page = 1;
                  },
                })
              ),
              ...props.customFilters.map(filter => {
                if (filter.slotName && typeof slots[filter.slotName] === "function") {
                  return h(IonCol, { size: `${filter.gridSize}` || '3' }, slots[filter.slotName]!({filter}))
                }
                if (filter.type === 'dateRange') {
                  return h(IonCol, { size: `${filter.gridSize}` || '6' },
                    h(DateRangePicker, {
                      range: (computed(() => filter.value || { startDate: "", endDate: "" })).value,
                      onRangeChange: async (newRange: any) => {
                        if(typeof filter.onUpdate === "function") filter.onUpdate(newRange);
                        customFiltersValues[filter.id] = newRange;
                      }
                    })
                  )
                } else if (filter.type === 'select') {
                  return h(IonCol, { size: `${filter.gridSize}` || '3' },
                    h(SelectInput, {
                      options: filter.options,
                      placeholder: filter.label || filter.placeholder || 'Select Item',
                      value: filter.value,
                      multiple: filter.multiple,
                      onSelect: (v: Option | Option[]) => {
                        if(typeof filter.onUpdate === "function") filter.onUpdate(v);
                        customFiltersValues[filter.id] = v
                      }
                    })
                  )
                } else {
                  return h(IonCol, { size: '4' },
                    h(IonInput, {
                      class: 'box',
                      type: filter.type,
                      placeholder: filter.placeholder,
                      value: (computed(() => filter.value || "")).value,
                      onIonInput: async (e: Event) => {
                        const value =  (e.target as HTMLInputElement).value;
                        if(typeof filter.onUpdate === "function") filter.onUpdate(value);
                        customFiltersValues[filter.id] = value;
                      }
                    })
                  )
                }
              }),
              props.customFilters.length > 0 && props.config.showSubmitButton !== false && h(IonCol, { size: '2', class: "ion-margin-bottom" },
                h(IonButton, { color: "primary", onClick: () => emit("customFilter", customFiltersValues) }, 'Submit')
              )
            ])
          ),
          h(IonCol, { size: '5', class: "ion-padding-end" },
            props.actionsButtons.map(btn => h(IonButton, {
              class: 'ion-float-right',
              color: btn.color || 'primary',
              onClick: () => btn.action(activeRows.value, tableRows.value, filters, tableColumns.value)
            }, [
              btn.label,
              btn.icon && h('span', { style: { color: 'white', paddingLeft: '5px', paddingRight: '5px' } }, ' | '),
              btn.icon && h(IonIcon, { icon: btn.icon }),
            ]))
          )
        ])
      ),
      h("div", { class: "responsive-table ion-padding-horizontal" },
        h("table", { class: "table bordered-table striped-table" }, [
          h("thead", { class: props.color || "" },
            h("tr", [
              ...tableColumns.value.map(column =>
                h("th", { key: column.label, style: { minWidth: column.path.match(/index/i) ? '80px' : '190px' }, onClick: () => DT.updateSortQueries(filters.sort, column) },
                  [
                    h("span", column.label),
                    column.sortable !== false && h(IonIcon, {
                      icon: (computed(() => {
                        const query = filters.sort.find(s => s.column.path === column.path);
                        return !query ? swapVertical : query.order == "asc" ? arrowUp : arrowDown;
                      })).value,
                      style: {
                        marginRight: "5px",
                        float: "right",
                        cursor: 'pointer'
                      }
                    })
                  ]
                )
              ),
              !isEmpty(props.rowActionsButtons) && h('th', 'Actions')
            ])
          ),
          h("tbody", { class: "table-body" }, isLoading.value
            ? [...Array(10)].map((i: number) =>
              h("tr", { key: i },
                h('td', { colspan: totalColumns.value },
                  h(IonSkeletonText, { animated: true, style: { width: '100%' } })
                )
              )
            )
            : isEmpty(filteredRows.value)
              ? h('tr', h('td', { colspan: totalColumns.value },
                h('div', { class: 'no-data-table' }, 'No data available')
              ))
              : activeRows.value.map((row, rowIndex) =>
                h('tr', {
                  key: row, onClick: async () => {
                    const defualtActionBtn = props.rowActionsButtons.find(btn => btn.default)
                    if (defualtActionBtn) await defualtActionBtn.action(row, rowIndex)
                  }
                }, [
                  ...tableColumns.value.map((column, index) => {
                    let value = get(row, column.path);
                    if (typeof column.formatter === 'function' && value) value = column.formatter(value, row)
                    return h('td', { key: index, style: { inlineSize: 'min-content', wordWrap: 'break-all' } },
                      column.drillable && !isEmpty(value)
                        ? h('a', { onClick: () => emit("drilldown", { column, row }) }, Array.isArray(value) ? value.length : value)
                        : Array.isArray(value)
                          ? value.length
                          : value
                    )
                  }),
                  !isEmpty(props.rowActionsButtons) && h('td', props.rowActionsButtons.map(btn => {
                    const canShowBtn = typeof btn.condition === 'function' ? btn.condition(row) : true;
                    return canShowBtn
                      ? h(IonButton, { key: btn.icon, size: 'small', color: btn.color || 'primary', onClick: () => btn.action(row, rowIndex) },
                        btn.icon ? h(IonIcon, { icon: btn.icon }) : btn.label || "Button"
                      )
                      : null
                  }))
                ])
              )
          ),
        ])
      ),
      h(IonGrid, { style: { width: '100%', textAlign: 'left', color: 'black' }, class: 'ion-padding' },
        h(IonRow, [
          h(IonCol, { size: '4' }, [
            h(IonButton, {
              color: "light",
              size: 'small',
              disabled: filters.pagination.page === filters.pagination.start,
              onClick: () => filters.pagination.page--
            }, h(
              IonIcon, { icon: caretBack }
            )),
            filters.pagination.start > 3 && h(IonButton, { size: 'small', color: "light", onClick: () => filters.pagination.page = 1 }, 1),
            filters.pagination.start > 3 && h(IonButton, { size: 'small', color: "light", disabled: true }, '...'),
            paginationPages.value.map(page => h(
              IonButton, {
              size: 'small',
              color: filters.pagination.page === page ? 'primary' : 'light',
              onClick: () => filters.pagination.page = page
            },
              page
            )),
            filters.pagination.end < (filters.pagination.totalPages - 2) && h(IonButton, { size: 'small', color: "light", disabled: true }, '...'),
            filters.pagination.end < (filters.pagination.totalPages - 2) && h(IonButton, { size: 'small', color: "light", onClick: () => filters.pagination.page = filters.pagination.totalPages }, filters.pagination.totalPages),
            h(IonButton, {
              color: "light",
              size: 'small',
              disabled: filters.pagination.page === filters.pagination.end || isEmpty(filteredRows.value),
              onClick: () => filters.pagination.page++
            }, h(
              IonIcon, { icon: caretForward }
            )),
          ]),
          h(IonCol, { size: '4', style: { textAlign: 'center' } }, [
            h(IonItem, { class: "box", lines: "none", style: { display: 'inline-block', '--min-height': '11px', width: '190px', marginLeft: '.5rem' } }, [
              h(IonLabel, { class: 'ion-margin-end' }, "Go to page"),
              h(IonInput, {
                type: "number",
                min: 1,
                max: filters.pagination.totalPages,
                value: filters.pagination.page,
                style: { paddingRight: '15px' },
                debounce: 500,
                onIonChange: (e: Event) => {
                  const page = parseInt((e.target as HTMLInputElement).value);
                  if (page > 0 && page <= filters.pagination.totalPages) {
                    filters.pagination.page = page;
                  }
                }
              }),
            ]),
            h(IonItem, { class: "box", lines: "none", style: { display: 'inline-block', '--min-height': '11px', width: '240px', marginLeft: '.5rem' } }, [
              h(IonLabel, "Items per page"),
              h(IonSelect, {
                value: filters.pagination.pageSize,
                onIonChange: (e: Event) => {
                  filters.pagination.pageSize = parseInt((e.target as HTMLInputElement).value)
                  filters.pagination.page = 1
                }
              }, [
                ...filters.pagination.pageSizeOptions.map((option, index) =>
                  h(IonSelectOption, { value: option, key: index }, option)
                ),
                h(IonSelectOption, { value: totalFilteredRows.value }, "All")
              ]),
            ]),
          ]),
          h(IonCol, { size: '4', class: "pagination-info" }, (computed(() => {
            return DT.buildPaginationInfo(filters.pagination, totalFilteredRows.value)
          })).value )
        ])
      )
    ]
  }
})