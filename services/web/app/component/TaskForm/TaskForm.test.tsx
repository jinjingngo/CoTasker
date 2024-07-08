import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TaskForm from './TaskForm';
import { Status } from '@/shared/schemas';

describe('TaskForm Component', () => {
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
    render(<TaskForm close={mockClose} save={mockSave} />);
    const expected = { title: 'New Task', notes: '' };
    await userEvent.type(
      screen.getByPlaceholderText('Type new Task here'),
      expected.title,
    );

    await userEvent.click(screen.getByText('Ok'));

    expect(mockSave).toHaveBeenCalledWith(expected);
  });

  it('should calls the close function when the Close button is clicked', async () => {
    render(<TaskForm close={mockClose} save={mockSave} />);

    await userEvent.click(screen.getByText('Close'));

    expect(mockClose).toHaveBeenCalled();
  });

  it('should populates the input with the provided task title', () => {
    const mockTask = {
      id: 1,
      todo_id: 1,
      title: 'Existing Task',
      status: 'IN_PROGRESS' as Status,
      created_date: new Date(),
      updated_date: new Date(),
    };

    render(<TaskForm task={mockTask} close={mockClose} save={mockSave} />);

    expect(screen.getByDisplayValue('Existing Task')).toBeDefined();
  });

  it('should not submit an empty form', async () => {
    render(<TaskForm close={mockClose} save={mockSave} />);

    await userEvent.click(screen.getByText('Ok'));

    expect(mockSave).not.toHaveBeenCalled();
  });
});
