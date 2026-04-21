import type { ShellLayoutItem, ShellWidget } from './shellTypes';

export function getWidthFromSize(size: string | undefined): number {
  if (size === '1/3') return 4;
  if (size === '1/2') return 6;
  if (size === '2/3') return 8;
  if (size === '1/1') return 12;
  return 4;
}

export function generatePreviewLayout(
  widgets: ShellWidget[],
  widgetSizes: Record<string, string> = {},
): ShellLayoutItem[] {
  const layout: ShellLayoutItem[] = [];
  let x = 0;
  let y = 0;
  const rowHeight = 2;

  widgets.forEach((widget) => {
    const w = getWidthFromSize(widgetSizes[widget.id] || '1/3');
    if (x + w > 12) {
      x = 0;
      y += rowHeight;
    }
    layout.push({ i: widget.id, x, y, w, h: rowHeight });
    x += w;
  });

  return layout;
}

/**
 * A la lecture initiale on recalcule le layout a partir des widgets et des
 * tailles, pour gerer le cas ou le localStorage est desynchronise avec la
 * liste actuelle (widget retire, renomme, etc.).
 */
export function getOrderedAndCompleteLayout(
  widgets: ShellWidget[],
  _layout: ShellLayoutItem[] = [],
  widgetSizes: Record<string, string> = {},
): ShellLayoutItem[] {
  return generatePreviewLayout(widgets, widgetSizes);
}
