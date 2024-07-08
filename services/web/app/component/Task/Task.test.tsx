import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  MockInstance,
} from 'vitest';
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from '@testing-library/react';
import { ReactNode } from 'react';
import toast from 'react-hot-toast';
import Task from './Task';

import type { Task as TaskType } from '@/shared/schemas';
import { TaskTree } from '@/app/types';

vi.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: ReactNode }) => {
      return <a>{children}</a>;
    },
  };
});

vi.mock('react-hot-toast', () => {
  return {
    __esModule: true,
    default: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

describe('Task Component', () => {
  const mockTodo = {
    id: 1,
    uuid: 'fake_uuid',
    title: 'Test Todo',
    created_date: new Date(),
    updated_date: new Date(),
  };

  const mockTask: TaskTree = {
    id: 1,
    todo_id: 1,
    status: 'IN_PROGRESS',
    title: 'Test Task',
    notes: 'Some notes',
    created_date: new Date(),
    updated_date: new Date(),
    children: [],
  };

  const deleteTask = vi.fn();
  const updateTask = vi.fn();
  const broadcast = vi.fn();

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('should renders correctly', () => {
    render(
      <Task
        task={mockTask}
        todo={mockTodo}
        deleteTask={deleteTask}
        updateTask={updateTask}
        broadcast={broadcast}
      />,
    );
    expect(screen.getByText(mockTask.title)).toBeDefined();
  });

  it('should enters editing mode', () => {
    render(
      <Task
        task={mockTask}
        todo={mockTodo}
        deleteTask={deleteTask}
        updateTask={updateTask}
        broadcast={broadcast}
      />,
    );
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByPlaceholderText('Type new Task here')).toBeDefined();
  });

  it('should deletes a todo item', async () => {
    (global.fetch as unknown as MockInstance).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    render(
      <Task
        task={mockTask}
        todo={mockTodo}
        deleteTask={deleteTask}
        updateTask={updateTask}
        broadcast={broadcast}
      />,
    );

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Deleted');
    });
    expect(deleteTask).toHaveBeenCalled();
  });
});
