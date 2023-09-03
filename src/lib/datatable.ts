import { computed, defineComponent, h, onMounted, PropType, reactive, ref, watch } from "vue";
import { TableColumnInterface, TableFilterInterface, ActionButtonInterface, RowActionButtonInterface, CustomFilterInterface, TableConfigInterface, Option, TextFieldTypes, PaginationButton, PaginationInterface } from "./types";
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
    const totalFilteredRows = computed(() => filteredRows.value.length);
    const totalColumns = computed(() => isEmpty(props.rowActionsButtons) ? tableColumns.value.length : tableColumns.value.length + 1);
    const paginationPages = computed(() => filters.pagination.enabled ? range(filters.pagination.start, filters.pagination.end + 1) : []);
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
    
    const activeRows = ref([] as Array<any>);
    const showFilterSection = computed<boolean>(() => {
      return props.config.showSearchField !== false ||
        props.customFilters.length > 0 ||
        props.actionsButtons.length > 0
    })

    const customFiltersValues = reactive<Record<string, any>>(
      props.customFilters.reduce((acc, filter) => {
        acc[filter.id] = filter.value;
        return acc;
      }, {} as Record<string, any>)
    );


    const init = async () => {
      isLoading.value = true;
      tableRows.value = await DT.getRows(props.rows, props.config.showIndices || false, props.asyncRows);
      filters.sort = DT.initializeSortQueries(tableColumns.value);
      handleFilters(filters.pagination);
      isLoading.value = false;
    }

    const handleFilters = (paginator: PaginationInterface, search?: string, sortColumn?: TableColumnInterface) => {
      if(search) filters.search = search;
      if(sortColumn) filters.sort = DT.updateSortQueries(filters.sort, sortColumn);
      console.log("Current filters", filters);
      const _filteredRows = DT.filterRows(tableRows.value, filters.search);
      console.log("Filters rows", _filteredRows);
      filteredRows.value = DT.sortRows(_filteredRows, filters.sort);
      console.log("Sorted Rows", filteredRows.value);
      filters.pagination = DT.calculatePageRange(paginator, totalFilteredRows.value, paginationPages.value);
      console.log("Updated filters", filters);
      activeRows.value = DT.getActiveRows(filteredRows.value, filters.pagination);
      console.log("Active rows", activeRows.value);
    }

    watch(customFiltersValues, () => {
      if (props.config.showSubmitButton === false) {
        emit("customFilter", customFiltersValues)
      }
    }, 
    {
      immediate: true,
      deep: true
    });

    watch(() => props.rows, () => init(), { deep: true, immediate: true });
    onMounted(() => init());

    const renderSearchbar = () => {
      if (props.config.showSearchField !== false && !isEmpty(tableRows.value)) {
        return h(IonCol, { size: '3', class: "ion-margin-bottom" }, [
          h(IonSearchbar, {
            placeholder: 'Search here...',
            class: 'box ion-no-padding',
            value: filters.search,
            onIonChange: (e) => handleFilters(filters.pagination, e.target.value as string),
          })
        ]);
      }
      return null;
    };

    const renderSelectFilter = (filter: CustomFilterInterface) => h(
      IonCol, { size: `${filter.gridSize}` || '3' }, h(
        SelectInput, {
        options: filter.options,
        placeholder: filter.label || filter.placeholder || 'Select Item',
        value: filter.value,
        multiple: filter.multiple,
        onSelect: (v: Option | Option[]) => {
          if (typeof filter.onUpdate === "function") filter.onUpdate(v);
          customFiltersValues[filter.id] = v
        }
      }
      )
    );

    const renderDateRangeFilter = (filter: CustomFilterInterface) => h(
      IonCol, { size: `${filter.gridSize}` || '6' }, h(
        DateRangePicker, {
        range: (computed(() => filter.value || { startDate: "", endDate: "" })).value,
        onRangeChange: async (newRange) => {
          if (typeof filter.onUpdate === "function") filter.onUpdate(newRange);
          customFiltersValues[filter.id] = newRange;
        }
      }
      )
    );

    const renderDefaultFilter = (filter: CustomFilterInterface) => h(
      IonCol, { size: '4' }, h(
        IonInput, {
        class: 'box',
        type: filter.type as TextFieldTypes,
        placeholder: filter.placeholder,
        value: (computed(() => filter.value || "")).value,
        onIonInput: async (e) => {
          const value = e.target.value;
          if (typeof filter.onUpdate === "function") filter.onUpdate(value);
          customFiltersValues[filter.id] = value;
        }
      }
      )
    );

    const renderCustomFilters = () => {
      return props.customFilters.map(filter => {
        if (filter.slotName && typeof slots[filter.slotName] === "function") {
          return h(IonCol, { size: `${filter.gridSize || '3'}` }, slots[filter.slotName]!({ filter }));
        }
        if (filter.type === 'dateRange') return renderDateRangeFilter(filter);
        if (filter.type === 'select') return renderSelectFilter(filter)
        return renderDefaultFilter(filter);
      });
    };

    const renderSubmitButton = () => {
      if (props.customFilters.length > 0 && props.config.showSubmitButton !== false) {
        return h(IonCol, { size: '2', class: "ion-margin-bottom" }, [
          h(IonButton, { color: "primary", onClick: () => emit("customFilter", customFiltersValues) }, 'Submit')
        ]);
      }
      return null;
    };

    const renderActionsButtons = () => {
      return props.actionsButtons.map(btn => h(
        IonButton,
        {
          class: 'ion-float-right',
          color: btn.color || 'primary',
          onClick: () => btn.action(activeRows.value, tableRows.value, filters, tableColumns.value)
        },
        [
          btn.label,
          btn.icon && h('span', { style: { color: 'white', paddingLeft: '5px', paddingRight: '5px' } }, ' | '),
          btn.icon && h(IonIcon, { icon: btn.icon }),
        ]
      ));
    };


    const renderFilterSection = () => {
      return showFilterSection.value && h(IonGrid, { class: "ion-padding-vertical", style: { width: '100%', fontWeight: 500 } },
        h(IonRow, [
          h(IonCol, { size: '7' },
            h(IonRow, [
              renderSearchbar(),
              ...renderCustomFilters(),
              renderSubmitButton(),
            ])
          ),
          h(IonCol, { size: '5', class: "ion-padding-end" }, renderActionsButtons())
        ])
      );
    };

    const renderPagination = () => {
      return h(IonGrid, { style: { width: '100%', textAlign: 'left', color: 'black' }, class: 'ion-padding' },
        h(IonRow, [
          h(IonCol, { size: '4' }, renderPaginationControls()),
          h(IonCol, { size: '4', class: "text-center" }, [
            renderGoToPageInput(),
            renderItemsPerPageSelect()
          ]),
          h(IonCol, { size: '4' }, renderPaginationInfo())
        ])
      );
    };

    const renderPaginationControls = () => {
      const {page, start, end, totalPages } = filters.pagination;
      const handleClick = (page: number) => {
        return handleFilters({...filters.pagination, page })
      };

      const controls = [
        renderPageControlButton({
          icon: caretBack, 
          disabled: page === start, 
          onClick: () => handleClick(page - 1)
        }),
      ];

      if (start > 3) {
        controls.push(renderPageControlButton({ label: '1', onClick: () => handleClick(1)}))
        controls.push(renderPageControlButton({ label: '...', disabled: true }))
      }

      paginationPages.value.forEach(label => {
        controls.push(renderPageControlButton({ label, onClick: () => handleClick(label)}))
      })

      if (end < totalPages - 2) {
        controls.push(renderPageControlButton({ label: '...', disabled: true }));
        controls.push(renderPageControlButton({ label: totalPages, onClick: () => handleClick(totalPages) }));
      }
      
      controls.push(renderPageControlButton({ 
        icon: caretForward, 
        disabled: page === end || isEmpty(filteredRows.value), 
        onClick: () => handleClick(page + 1) 
      }))

      return controls
    };

    const renderPageControlButton = ({ disabled, label, icon, onClick }: PaginationButton) => {
      return h(
        IonButton,
        {
          onClick,
          disabled,
          size: 'small',
          color: filters.pagination.page === label ? 'primary' : 'light',
        },
        icon ? h(IonIcon, { icon }) : label || "Button"
      );
    }

    const renderGoToPageInput = () => {
      return h(IonItem, { class: "box go-to-input", lines: "none" }, [
        h(IonLabel, { class: 'ion-margin-end' }, "Go to page"),
        h(IonInput, {
          type: "number",
          min: 1,
          max: filters.pagination.totalPages,
          value: filters.pagination.page,
          style: { paddingRight: '15px' },
          debounce: 500,
          onIonChange: (e) => {
            const page = e.target.value as number;
            if (page > 0 && page <= filters.pagination.totalPages) {
              handleFilters({...filters.pagination, page });
            }
          }
        }),
      ])
    };

    const renderItemsPerPageSelect = () => {
      return h(IonItem, { class: "box per-page-input", lines: "none" }, [
        h(IonLabel, "Items per page"),
        h(IonSelect, {
          value: filters.pagination.pageSize,
          onIonChange: (e) => handleFilters({
            ...filters.pagination, 
            pageSize: e.target.value as number, 
            page: 1
          }),
        }, [
          ...filters.pagination.pageSizeOptions.map(value => h(IonSelectOption, { value, key: value }, value)),
          h(IonSelectOption, { value: totalFilteredRows.value }, "All")
        ]),
      ])
    };

    const renderPaginationInfo = () => {
      return h(IonCol, { size: '4', class: "pagination-info" }, (computed(() => {
        return DT.buildPaginationInfo(filters.pagination, totalFilteredRows.value);
      })).value);
    };


    const renderTableHeader = () => h(
      "thead", { class: props.color || "" }, h(
        "tr", [
        ...tableColumns.value.map(column => renderTableHeaderCell(column)),
        !isEmpty(props.rowActionsButtons) && h('th', 'Actions')
      ]
      )
    );

    const renderSortIcon = (column: TableColumnInterface) => {
      const style = { marginRight: "5px", float: "right", cursor: 'pointer' }
      const icon = computed(() => {
        const query = filters.sort.find(s => s.column.path === column.path);
        return !query ? swapVertical : query.order == "asc" ? arrowUp : arrowDown;
      })
      return h(IonIcon, { icon: icon.value, style })
    }

    const renderTableHeaderCell = (column: TableColumnInterface) => {
      const style = { minWidth: /index/i.test(column.path) ? '80px' : '190px' };
      const onClick = () => handleFilters(filters.pagination, filters.search, column);
      return h("th", { key: column.label, style, onClick }, [
        h("span", column.label),
        column.sortable !== false && renderSortIcon(column),
      ]);
    };

    const renderTableBody = () => {
      return h("tbody", { class: "table-body" }, isLoading.value
        ? renderLoadingRows()
        : isEmpty(filteredRows.value)
          ? renderNoDataRow()
          : renderDataRows()
      );
    };

    const renderLoadingRows = () => {
      return range(0, 9).map(i => h(
        "tr", { key: i }, h(
          'td', { colspan: totalColumns.value }, h(
            IonSkeletonText, { animated: true, style: { width: '100%' } })
        )
      )
      );
    };

    const renderNoDataRow = () => {
      return h('tr', h('td', { colspan: totalColumns.value },
        h('div', { class: 'no-data-table' }, 'No data available')
      ));
    };

    const handleRowClick = async (row: any, rowIndex: number) => {
      const defaultActionBtn = props.rowActionsButtons.find(btn => btn.default);
      if (defaultActionBtn) await defaultActionBtn.action(row, rowIndex);
    };

    const renderDataRows = () => {
      return activeRows.value.map((row, rowIndex) =>
        h('tr', { key: row, onClick: () => handleRowClick(row, rowIndex) }, [
          ...renderDataRowCells(row),
          renderRowActionCells(row, rowIndex)
        ])
      );
    };


    const renderDataRowCells = (row: any) => {
      return tableColumns.value.map((column, key) =>
        h('td', { key, class: "data-cell" }, renderCellContent(row, column))
      );
    };

    const renderCellContent = (row: any, column: TableColumnInterface) => {
      let value = get(row, column.path);
      if (typeof column.formatter === 'function' && value) value = column.formatter(value, row);
      if (column.drillable && !isEmpty(value)) {
        return h('a', { onClick: () => emit("drilldown", { column, row }) }, renderCellValue(value));
      } else {
        return renderCellValue(value);
      }
    };

    const renderCellValue = (value: Array<any> | string | number) => {
      return Array.isArray(value) ? value.length : value;
    };

    const renderRowActionCells = (row: any, rowIndex: number) => {
      if (!isEmpty(props.rowActionsButtons)) {
        return h('td', props.rowActionsButtons.map(btn => {
          const canShowBtn = typeof btn.condition === 'function' ? btn.condition(row) : true;
          return canShowBtn ? renderRowActionButton(row, rowIndex, btn) : null;
        }));
      }
      return null
    };

    const renderRowActionButton = (row: any, rowIndex: number, btn: RowActionButtonInterface) => {
      return h(IonButton, {
        key: btn.icon,
        size: 'small',
        color: btn.color || 'primary',
        onClick: () => btn.action(row, rowIndex)
      },
        btn.icon ? h(IonIcon, { icon: btn.icon }) : btn.label || "Button"
      );
    };

    const renderTable = () => {
      return h("div", { class: "responsive-table ion-padding-horizontal" },
        h("table", { class: "table bordered-table striped-table" }, [
          renderTableHeader(),
          renderTableBody()
        ])
      );
    };

    return () => [
      renderFilterSection(),
      renderTable(),
      renderPagination(),
    ]
  }
})