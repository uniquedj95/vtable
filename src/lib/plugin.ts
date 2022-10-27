import { App, Plugin } from 'vue';
import { DataTable } from './datatable';
import { TableGlobalConfig } from './types';

// The Install function used by Vue to register the plugin
export const VTable: Plugin = {
  install(app: App, options: TableGlobalConfig) {
    app.config.globalProperties.$tableTheme = options.color
    app.component('DataTable', DataTable)
  }
}