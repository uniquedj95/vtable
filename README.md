# vTable

An advanced data table component for the Ionic Vue framework, offering powerful features for data display, manipulation, and interaction.

<p>
  <a href="https://sonarcloud.io/summary/new_code?id=uniquedj95_vtable"><img src="https://sonarcloud.io/api/project_badges/measure?project=uniquedj95_vtable&metric=alert_status" /></a>
  <a href="https://ionicframework.com/"><img src="https://badgen.net/badge/Ionic/5.x/blue" alt="Ionic"></a>
  <a href="https://vuejs.org/"><img src="https://badgen.net/badge/Vue/3.x/cyan" alt="Vue"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://badgen.net/badge/Typescript/4.x/yellow" alt="TS"></a>
  <a href="https://www.npmjs.com/package/@uniquedj95/vtable"><img src="https://img.shields.io/npm/dm/@uniquedj95/vtable.svg" alt="Downloads"></a>
</p>

![Example Table](screenshort.png 'Example Table')

---

## Installation

Install via npm or yarn:

```bash
npm install @uniquedj95/vtable
# OR
yarn add @uniquedj95/vtable
```

---

## Usage

### Register vTable Globally

```typescript
// src/main.ts
import { VTable } from '@uniquedj95/vtable';
// Import datatable CSS
import '@uniquedj95/vtable/dist/lib/datatable.css';

const app = createApp(App).use(IonicVue).use(VTable).use(router);

router.isReady().then(() => {
  app.mount('#app');
});
```

```html
<!-- Example.vue -->
<template>
  <data-table :rows="rows" :columns="columns"></data-table>
</template>
```

### Register vTable Locally

```html
<script lang="ts">
  import { DataTable } from '@uniquedj95/vtable';
  import { defineComponent } from 'vue';

  export default defineComponent({
    data: () => ({
      rows: [],
      columns: [],
    }),
    components: {
      DataTable,
    },
  });
</script>

<template>
  <data-table :rows="rows" :columns="columns"></data-table>
</template>
```

> **Note:** You must manually import styles from `@uniquedj95/vtable/dist/lib/datatable.css`.

---

## API Reference

### 1. Props

| Prop Name        | Default Value | Description                                                           |
| ---------------- | ------------- | --------------------------------------------------------------------- |
| rows             | [ ]           | List of data objects mapped into table rows                           |
| asyncRows        | undefined     | A promise function that returns a list of data                        |
| columns          | [ ]           | List of table column definitions                                      |
| actionButtons    | [ ]           | List of buttons for global table actions                              |
| rowActionButtons | [ ]           | List of buttons for actions affecting specific rows                   |
| customFilters    | [ ]           | List of custom filters affecting the data source                      |
| color            | undefined     | Color theme for the datatable. Accepted: `primary`, `secondary`, etc. |
| config           | undefined     | Configuration object affecting datatable behavior                     |

#### 1.1 Table Column

A table column is defined with the following properties:

| Property Name     | Required | Description                                                         |
| ----------------- | -------- | ------------------------------------------------------------------- | ------ | ------------------------------ |
| label             | Yes      | The column heading text (e.g. `First Name`)                         |
| path              | Yes      | The key used to map row data to this column (e.g. `first_name`)     |
| exportable        | No       | If true, values in this column can be exported (default: `true`)    |
| initialSort       | No       | If true, this column is used for initial sorting (default: `false`) |
| sortable          | No       | If true, this column can be sorted (default: `true`)                |
| initialSortOrder  | No       | Initial sort order: `"asc"                                          | "desc" | "none"`(requires`initialSort`) |
| sortCaseSensitive | No       | If true, sorting is case sensitive (default: `false`)               |
| drillable         | No       | If true, column data can be drilled (default: `false`)              |
| preSort           | No       | Function to process values before sorting                           |
| formatter         | No       | Function to format values for display                               |

#### 1.2 Action Button

Action buttons are displayed above the table and affect the entire table. Each action button has the following properties:

| Property Name | Required | Type     | Description                                                               |
| ------------- | -------- | -------- | ------------------------------------------------------------------------- | --- |
| label         | Yes      | String   | Button label (e.g. `Submit`)                                              |
| icon          | No       | ionicons | Icon displayed with the label, separated by `                             | `   |
| color         | No       | String   | Button color (default: `primary`)                                         |
| action        | Yes      | Function | Click handler. Receives `activeRows`, `allRows`, `filters`, and `columns` |

#### 1.3 Row Action Button

Row action buttons are attached to each row for row-specific actions. Each button has the following properties:

| Property Name | Required | Type     | Description                                                              |
| ------------- | -------- | -------- | ------------------------------------------------------------------------ |
| label         | No       | String   | Button label. If both label and icon are missing, defaults to `"Button"` |
| icon          | No       | ionicon  | Icon string. If both label and icon are defined, icon is used            |
| color         | No       | String   | Button color (default: `primary`)                                        |
| default       | No       | Boolean  | If true, button listens to whole row clicks (default: `false`)           |
| condition     | No       | Function | Returns boolean to show/hide the button (default: `() => true`)          |
| action        | Yes      | Function | Click handler. Receives row data and its index                           |

#### 1.4 Custom Filter

Custom filters are used when fetching data from the source/API. Each filter has the following properties:

| Property Name | Required | Type     | Description                                        |
| ------------- | -------- | -------- | -------------------------------------------------- | -------- | ------ | -------- | ------------ |
| id            | Yes      | String   | Unique identifier for the filter                   |
| label         | No       | String   | Filter input label                                 |
| value         | No       | any      | Default value for the filter                       |
| gridSize      | No       | Number   | Column grid size (1-12)                            |
| type          | Yes      | String   | Filter input type: `"text"                         | "number" | "date" | "select" | "dateRange"` |
| options       | No       | Array    | Options for select input filters                   |
| placeholder   | No       | String   | Placeholder text when no value is set              |
| required      | No       | Boolean  | If true, filter must be set before emitting events |
| multiple      | No       | Boolean  | For `select` type: allows multiple selection       |
| onUpdate      | No       | Function | Callback when filter value changes                 |
| slotName      | No       | String   | Used for defining named slots for advanced filters |

##### 1.4.1 Filter Option

A filter option object has the following properties:

| Property Name | Required | Type          | Description                                         |
| ------------- | -------- | ------------- | --------------------------------------------------- |
| label         | Yes      | String        | Option label                                        |
| value         | Yes      | String/Number | Option value                                        |
| isChecked     | No       | Boolean       | If true, option is selected (for checkboxes/radios) |
| other         | No       | any           | Any additional data                                 |

#### 1.5 Table Config

General configuration options for the datatable:

| Property Name    | Required | Type    | Default | Description                                                                                                     |
| ---------------- | -------- | ------- | ------- | --------------------------------------------------------------------------------------------------------------- |
| showSubmitButton | No       | Boolean | false   | Show/hide submit button for custom filters. If enabled, filter changes are not emitted until submit is pressed. |
| showSearchField  | No       | Boolean | true    | Show/hide the search input field. If disabled, search is hidden even if data is available.                      |
| showIndices      | No       | Boolean | false   | Show/hide index numbers column                                                                                  |

---

### 2. Events

The data table emits the following events:

| Event Name   | Description                                                                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| customFilter | Emitted when the submit button is clicked and all required filters are set. If `showSubmitButton` is false, emitted whenever a filter changes. |
| drilldown    | Emitted when a drillable cell is clicked                                                                                                       |

---

## Examples

### Basic Usage

```vue
<template>
  <data-table :rows="rows" :columns="columns" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const rows = ref([
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 },
]);

const columns = ref([
  { label: 'ID', path: 'id' },
  { label: 'Name', path: 'name' },
  { label: 'Age', path: 'age', sortable: true },
]);
</script>
```

### With Action Buttons

```vue
<template>
  <data-table :rows="rows" :columns="columns" :actionButtons="actionButtons" />
</template>

<script setup lang="ts">
const actionButtons = [
  {
    label: 'Export',
    icon: 'download-outline',
    color: 'secondary',
    action: (activeRows, allRows) => {
      // Export logic here
      alert(`Exporting ${activeRows.length} rows`);
    },
  },
];
</script>
```

### With Row Action Buttons

```vue
<template>
  <data-table :rows="rows" :columns="columns" :rowActionButtons="rowButtons" />
</template>

<script setup lang="ts">
const rowButtons = [
  {
    icon: 'trash-outline',
    color: 'danger',
    action: (row, index) => {
      // Delete logic here
      alert(`Delete row ${index + 1}`);
    },
  },
];
</script>
```

### With Custom Filters

```vue
<template>
  <data-table
    :rows="rows"
    :columns="columns"
    :customFilters="filters"
    @customFilter="onFilter"
  />
</template>

<script setup lang="ts">
const filters = [
  {
    id: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'Search by name',
  },
];

function onFilter(filterValues) {
  // Handle filter changes
  console.log(filterValues);
}
</script>
```

---

## Development

This project uses modern development tools to ensure code quality and consistency:

### 🛠️ Development Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Watch mode for development
npm run test:watch

# Build the project
npm run build
```

### 📋 Code Quality Tools

- **ESLint**: Linting and code quality checks
- **Prettier**: Code formatting
- **Husky**: Git hooks automation
- **Commitlint**: Conventional commit message validation
- **Lint-staged**: Run linters on staged files only

### 🎯 Available Scripts

```bash
# Linting
npm run lint          # Lint and auto-fix issues
npm run lint:check    # Check for lint issues without fixing

# Formatting
npm run format        # Format all files with Prettier
npm run format:check  # Check if files are formatted correctly

# Testing
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:ui       # Run tests with UI

# Building
npm run build         # Build the project for production
```

### 📝 Commit Message Format

This project follows [Conventional Commits](https://conventionalcommits.org/). Use the following format:

```
type(scope): description

# Examples:
feat: add new filtering feature
fix: resolve pagination bug
docs: update API documentation
refactor: improve table rendering performance
```

For more details on development standards, see [CODE_STANDARDS.md](CODE_STANDARDS.md).

---

## Contribution

Contributions are welcome! Please open issues or submit pull requests for improvements, bug fixes, or new features.

---

## License

[MIT](LICENSE)
