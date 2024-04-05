import userEvent from '@testing-library/user-event';

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

import AddButton from './AddButton';

describe('AddButton', () => {
  afterEach(cleanup);

  it('renders children correctly', () => {
    render(
      <AddButton onClick={() => {}} disabled={false}>
        Click me!
      </AddButton>,
    );
    const button = screen.getByRole('button', { name: 'Click me!' });
    expect(button).toBeDefined();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(
      <AddButton onClick={handleClick} disabled={false}>
        Click me!
      </AddButton>,
    );
    const button = screen.getByRole('button', { name: 'Click me!' });
    await userEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when the disabled prop is true', () => {
    render(
      <AddButton onClick={() => {}} disabled={true}>
        Cannot click
      </AddButton>,
    );
    const button = screen.getByRole('button', {
      name: 'Cannot click',
    }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('has specific classes when disabled', () => {
    render(
      <AddButton onClick={() => {}} disabled={true}>
        Cannot click
      </AddButton>,
    );
    const button = screen.getByRole('button', { name: 'Cannot click' });
    const classList = Array.from(button.classList);
    expect(classList).toContain('disabled:text-gray-400');
    expect(classList).toContain('disabled:cursor-not-allowed');
  });
});
