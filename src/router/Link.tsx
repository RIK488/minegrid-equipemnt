import React from 'react';
import { navigate } from './hashRouter';

/**
 * <Link to="dashboard/stats" search={{ tab: 'overview' }}>Stats</Link>
 *
 * Rend un <a href="#..."> standard (bon pour SEO / accessibilite / ctrl-click
 * ouvre dans un nouvel onglet) mais intercepte le clic normal pour passer
 * par navigate() — ce qui permettra plus tard de changer la strategie
 * (history API, react-router, etc.) sans toucher aux pages.
 */

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  search?: Record<string, string | number | undefined>;
  replace?: boolean;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, search, replace, onClick, children, ...rest },
  ref,
) {
  const cleanTo = to.startsWith('#') ? to.slice(1) : to;
  const params = search
    ? new URLSearchParams(
        Object.entries(search)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) => [k, String(v)]),
      ).toString()
    : '';
  const href = `#${cleanTo}${params ? `?${params}` : ''}`;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    // Laisse passer les modificateurs (ctrl-click, cmd-click, middle-click...)
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    if (rest.target && rest.target !== '_self') return;

    e.preventDefault();
    navigate(cleanTo, { search, replace });
  };

  return (
    <a ref={ref} href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
});

export default Link;
