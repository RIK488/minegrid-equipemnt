import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { Link } from './Link';

describe('<Link>', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('rend un <a href="#..."> standard', () => {
    render(<Link to="dashboard">Dashboard</Link>);
    const a = screen.getByRole('link');
    expect(a.getAttribute('href')).toBe('#dashboard');
  });

  it('construit un href avec query', () => {
    render(
      <Link to="machines" search={{ categorie: 'grue', page: 1 }}>
        Machines
      </Link>,
    );
    const a = screen.getByRole('link');
    expect(a.getAttribute('href')).toContain('#machines?');
    expect(a.getAttribute('href')).toContain('categorie=grue');
    expect(a.getAttribute('href')).toContain('page=1');
  });

  it('clic navigate et previent default', () => {
    render(<Link to="contact">Contact</Link>);
    const a = screen.getByRole('link');
    fireEvent.click(a, { button: 0 });
    expect(window.location.hash).toBe('#contact');
  });

  it('ctrl-click ne previent pas (ouvre dans nouvel onglet)', () => {
    const initial = window.location.hash;
    render(<Link to="contact">Contact</Link>);
    const a = screen.getByRole('link');
    fireEvent.click(a, { button: 0, ctrlKey: true });
    expect(window.location.hash).toBe(initial);
  });

  it('applique les classes/attributs html standards', () => {
    render(
      <Link to="x" className="btn" aria-label="vers X">
        X
      </Link>,
    );
    const a = screen.getByRole('link');
    expect(a.className).toBe('btn');
    expect(a.getAttribute('aria-label')).toBe('vers X');
  });
});
