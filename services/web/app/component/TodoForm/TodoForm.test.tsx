import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TodoForm from './TodoForm';

describe('TodoForm Component', () => {
  const mockClose = vi.fn();
  const mockSave = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('should submits the form with the new title', async () => {
    render(<TodoForm close={mockClose} save={mockSave} />);
    await userEvent.type(
      screen.getByPlaceholderText('Type new Todo here'),
      'New Todo',
    );

    await userEvent.click(screen.getByText('Ok'));

    expect(mockSave).toHaveBeenCalledWith('New Todo');
  });

  it('should calls the close function when the cancel button is clicked', async () => {
    render(<TodoForm close={mockClose} save={mockSave} />);

    await userEvent.click(screen.getByText('Cancel'));

    expect(mockClose).toHaveBeenCalled();
  });

  it('should populates the input with the provided todo title', () => {
    const mockTodo = {
      id: 1,
      title: 'Existing Todo',
      uuid: 'uuid-1',
      created_date: new Date(),
      updated_date: new Date(),
    };

    render(<TodoForm todo={mockTodo} close={mockClose} save={mockSave} />);

    expect(screen.getByDisplayValue('Existing Todo')).toBeDefined();
  });

  it('should not submit an empty form', async () => {
    render(<TodoForm close={mockClose} save={mockSave} />);

    await userEvent.click(screen.getByText('Ok'));

    expect(mockSave).not.toHaveBeenCalled();
  });
});
