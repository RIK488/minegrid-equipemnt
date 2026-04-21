/**
 * Types internes du shell mutualise. Ne pas confondre avec
 * `src/pages/enterprise/types.ts` qui decrit les types metier du
 * configurateur historique (Widget, WidgetLayout, DashboardConfig).
 */

export interface ShellWidget {
  id: string;
  title?: string;
  [key: string]: unknown;
}

export interface ShellWidgetsSource {
  widgets: ShellWidget[];
}

export interface ShellLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ShellDashboardConfig {
  widgets: ShellWidget[];
  layout: { lg: ShellLayoutItem[]; [key: string]: ShellLayoutItem[] };
  widgetSizes: Record<string, string>;
  lastSaved?: string;
}

export type ShellSaveStatus = 'idle' | 'saving' | 'saved';
export type ShellAddStatus = 'idle' | 'added';
