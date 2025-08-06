import { h } from 'vue';
import { IonBadge, IonChip, IonLabel } from '@ionic/vue';

/**
 * Common cell components that users can use for formatting data
 */

export interface ChipConfig {
  color?: string;
  outline?: boolean;
  size?: 'small' | 'default' | 'large';
}

export interface BadgeConfig {
  color?: string;
  size?: 'small' | 'default' | 'large';
}

export interface StatusConfig {
  [key: string]: {
    color: string;
    label?: string;
    outline?: boolean;
  };
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
 * Renders HTML content safely
 */
export const renderHtml = (htmlContent: string) => {
  return h('div', {
    innerHTML: htmlContent,
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
