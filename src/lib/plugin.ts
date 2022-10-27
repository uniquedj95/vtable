import { App, Plugin } from 'vue';
import { DataTable } from './datatable';
import { TableGlobalConfig } from './types';

// The Install function used by Vue to register the plugin
export const VTable: Plugin = {
  install(app: App, options?: TableGlobalConfig) {
    app.config.globalProperties.$globalTableOptions = options
    app.provide("globalTableOptions", options)
    app.component('DataTable', DataTable)
  }
}