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

| Property Name     | Required | Description                                                                 |
| ----------------- | -------- | --------------------------------------------------------------------------- |
| label             | Yes      | The column heading text (e.g. `First Name`)                                 |
| path              | Yes      | The key used to map row data to this column (e.g. `first_name`)             |
| exportable        | No       | If true, values in this column can be exported (default: `true`)            |
| initialSort       | No       | If true, this column is used for initial sorting (default: `false`)         |
| sortable          | No       | If true, this column can be sorted (default: `true`)                        |
| initialSortOrder  | No       | Initial sort order: `"asc"`, `"desc"`, or `"none"` (requires `initialSort`) |
| sortCaseSensitive | No       | If true, sorting is case sensitive (default: `false`)                       |
| drillable         | No       | If true, column data can be drilled (default: `false`)                      |
| preSort           | No       | Function to process values before sorting                                   |
| formatter         | No       | Function to format values for display (HTML content auto-detected)          |
| thStyles          | No       | CSS styles for table header cell                                            |
| thClasses         | No       | CSS classes for table header cell                                           |
| tdStyles          | No       | CSS styles for table data cells (can be function for dynamic styles)        |
| tdClasses         | No       | CSS classes for table data cells (can be function for dynamic classes)      |
| customRenderer    | No       | Function to completely customize cell content rendering                     |
| slotName          | No       | Name of Vue slot to use for custom cell content                             |
| component         | No       | Vue component to render in the cell                                         |
| componentProps    | No       | Function returning props for the Vue component                              |

##### 1.1.1 Advanced Column Formatting

vtable provides multiple ways to format and style column data, giving you complete control over presentation:

**Dynamic Styles and Classes:**

```typescript
{
  label: 'Score',
  path: 'score',
  tdStyles: (value, row) => ({
    color: value >= 80 ? 'green' : value >= 60 ? 'orange' : 'red',
    fontWeight: 'bold'
  }),
  tdClasses: (value, row) => [
    'score-cell',
    value >= 80 ? 'high-score' : 'low-score'
  ]
}
```

**Custom Renderers:**

```typescript
import { renderStatus, renderChipList, renderProgress } from '@uniquedj95/vtable';

// Status with colored chips
{
  label: 'Status',
  path: 'status',
  customRenderer: (value, row, column) => {
    const statusConfig = {
      active: { color: 'success', label: 'Active' },
      inactive: { color: 'danger', label: 'Inactive' },
      pending: { color: 'warning', label: 'Pending' }
    };
    return renderStatus(value, statusConfig);
  }
}

// Progress bar
{
  label: 'Progress',
  path: 'progress',
  customRenderer: (value) => {
    const color = value >= 80 ? 'success' : value >= 50 ? 'warning' : 'danger';
    return renderProgress(value, 100, color);
  }
}

// Multiple tags as chips
{
  label: 'Tags',
  path: 'tags',
  customRenderer: (value) => {
    return renderChipList(value, { color: 'primary', outline: true }, 3);
  }
}
```

**Vue Slots:**

```typescript
// Column definition
{
  label: 'Actions',
  path: 'id',
  slotName: 'actions',
  sortable: false
}
```

```vue
<!-- Template usage -->
<DataTable :columns="columns" :rows="rows">
  <template #actions="{ value, row, column }">
    <IonButton @click="editRow(row)" size="small">Edit</IonButton>
    <IonButton @click="deleteRow(row)" size="small" color="danger">Delete</IonButton>
  </template>
</DataTable>
```

**HTML Content (Auto-detected):**

```typescript
{
  label: 'Description',
  path: 'description',
  formatter: (value) => {
    // HTML content is automatically detected and rendered
    return value.replace(
      /(important|urgent)/gi,
      '<strong style="color: red;">$1</strong>'
    );
  }
}
```

**Vue Components:**

```typescript
import CustomRating from './CustomRating.vue';

{
  label: 'Rating',
  path: 'rating',
  component: CustomRating,
  componentProps: (value, row) => ({ rating: value, maxStars: 5 })
}
```

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

### 3. Pre-built Cell Components

vtable includes ready-to-use cell formatting components accessible via the utils export:

```typescript
import {
  renderStatus,
  renderChip,
  renderBadge,
  renderChipList,
  renderProgress,
  renderBoolean,
  renderHtml,
} from '@uniquedj95/vtable';
```

#### 3.1 Available Components

**`renderStatus(value, statusConfig, defaultConfig?)`**

- Renders status values with predefined colors and styles
- `statusConfig`: Object mapping status values to `{ color, label?, outline? }`

**`renderChip(value, config?, onClick?)`**

- Renders a single chip component
- `config`: `{ color?, outline?, size? }`

**`renderBadge(value, config?)`**

- Renders a badge component
- `config`: `{ color?, size? }`

**`renderChipList(values, config?, maxVisible?)`**

- Renders an array of values as chips with overflow handling
- Shows a "+X" chip when there are more items than `maxVisible`

**`renderProgress(value, max?, color?)`**

- Renders a progress bar
- `value`: Current progress value
- `max`: Maximum value (default: 100)
- `color`: Ionic color (default: 'primary')

**`renderBoolean(value, trueConfig?, falseConfig?)`**

- Renders boolean values as colored badges
- `trueConfig/falseConfig`: `{ color, label }`

**`renderHtml(htmlContent)`**

- Safely renders HTML content

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

### Advanced Column Formatting

```vue
<template>
  <data-table :rows="users" :columns="columns">
    <!-- Custom slot for actions -->
    <template #actions="{ row }">
      <IonButton @click="editUser(row)" size="small">Edit</IonButton>
      <IonButton @click="deleteUser(row)" size="small" color="danger"
        >Delete</IonButton
      >
    </template>
  </data-table>
</template>

<script setup lang="ts">
import { ref, h } from 'vue';
import {
  DataTable,
  renderStatus,
  renderChipList,
  renderBoolean,
  renderProgress,
} from '@uniquedj95/vtable';

const users = ref([
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active',
    score: 85,
    tags: ['developer', 'senior', 'javascript'],
    isActive: true,
    progress: 75,
    priority: 'high',
  },
  // ... more users
]);

const columns = ref([
  // Dynamic styling based on data
  {
    label: 'Name',
    path: 'name',
    tdStyles: (value, row) => ({
      fontWeight: row.isActive ? 'bold' : 'normal',
      color: row.isActive ? '#000' : '#666',
    }),
  },

  // Status with colored chips
  {
    label: 'Status',
    path: 'status',
    customRenderer: value => {
      const statusConfig = {
        active: { color: 'success', label: 'Active' },
        inactive: { color: 'danger', label: 'Inactive' },
        pending: { color: 'warning', label: 'Pending' },
      };
      return renderStatus(value, statusConfig);
    },
  },

  // Score with conditional classes
  {
    label: 'Score',
    path: 'score',
    tdClasses: value => [
      'score-cell',
      value >= 80 ? 'high-score' : value >= 60 ? 'medium-score' : 'low-score',
    ],
    tdStyles: value => ({
      color: value >= 80 ? 'green' : value >= 60 ? 'orange' : 'red',
      fontWeight: 'bold',
    }),
  },

  // Tags as chip list
  {
    label: 'Tags',
    path: 'tags',
    customRenderer: value => {
      return renderChipList(value, { color: 'primary', outline: true }, 2);
    },
  },

  // Progress bar
  {
    label: 'Progress',
    path: 'progress',
    customRenderer: value => {
      const color =
        value >= 80 ? 'success' : value >= 50 ? 'warning' : 'danger';
      return h('div', [
        renderProgress(value, 100, color),
        h(
          'small',
          {
            style: 'display: block; text-align: center; margin-top: 4px;',
          },
          `${value}%`
        ),
      ]);
    },
  },

  // Boolean as badge
  {
    label: 'Active',
    path: 'isActive',
    customRenderer: value => {
      return renderBoolean(
        value,
        { color: 'success', label: 'Yes' },
        { color: 'danger', label: 'No' }
      );
    },
  },

  // Priority with conditional background
  {
    label: 'Priority',
    path: 'priority',
    tdStyles: value => {
      const baseStyle = {
        padding: '6px 12px',
        borderRadius: '4px',
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'white',
      };

      switch (value) {
        case 'high':
          return { ...baseStyle, backgroundColor: '#e74c3c' };
        case 'medium':
          return { ...baseStyle, backgroundColor: '#f39c12' };
        case 'low':
          return { ...baseStyle, backgroundColor: '#27ae60' };
        default:
          return { ...baseStyle, backgroundColor: '#95a5a6' };
      }
    },
  },

  // Actions using slot
  {
    label: 'Actions',
    path: 'id',
    slotName: 'actions',
    sortable: false,
  },
]);

const editUser = user => {
  console.log('Edit user:', user);
};

const deleteUser = user => {
  console.log('Delete user:', user);
};
</script>

<style scoped>
.score-cell {
  text-align: center;
}

.high-score {
  background-color: #d4edda;
}

.medium-score {
  background-color: #fff3cd;
}

.low-score {
  background-color: #f8d7da;
}
</style>
```

### HTML Content Formatting

```vue
<script setup lang="ts">
const columns = ref([
  {
    label: 'Description',
    path: 'description',
    formatter: value => {
      // HTML content is automatically detected and rendered
      return value.replace(
        /(urgent|important|critical)/gi,
        '<span style="background: yellow; font-weight: bold;">$1</span>'
      );
    },
  },
]);
</script>
```

### Date Formatting with Relative Time

```vue
<script setup lang="ts">
const dateColumn = {
  label: 'Created',
  path: 'createdAt',
  formatter: value => {
    const date = new Date(value);
    return {
      formatted: date.toLocaleDateString(),
      relative: getRelativeTime(date),
      iso: date.toISOString(),
    };
  },
  customRenderer: value => {
    if (typeof value === 'object' && value.formatted) {
      return h('div', [
        h('div', { style: 'font-weight: 500;' }, value.formatted),
        h(
          'div',
          {
            style: 'font-size: 12px; color: #666;',
            title: value.iso,
          },
          value.relative
        ),
      ]);
    }
    return value;
  },
};

function getRelativeTime(date) {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return `${Math.floor(diffInDays / 7)} weeks ago`;
}
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
