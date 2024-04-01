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

import Todo from './Todo';

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

describe('Todo Component', () => {
  const mockTodo = {
    id: 1,
    uuid: 'fake_uuid',
    title: 'Test Todo',
    created_date: new Date(),
    updated_date: new Date(),
  };

  const deleteTodo = vi.fn();
  const updateTodo = vi.fn();

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('should renders correctly', () => {
    render(
      <Todo todo={mockTodo} deleteTodo={deleteTodo} updateTodo={updateTodo} />,
    );
    expect(screen.getByText('Test Todo')).toBeDefined();
  });

  it('should enters editing mode', () => {
    render(
      <Todo todo={mockTodo} deleteTodo={deleteTodo} updateTodo={updateTodo} />,
    );
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByPlaceholderText('Type new Todo here')).toBeDefined();
  });

  it('should deletes a todo item', async () => {
    (global.fetch as unknown as MockInstance).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    render(
      <Todo todo={mockTodo} deleteTodo={deleteTodo} updateTodo={updateTodo} />,
    );

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Updated');
    });
    expect(deleteTodo).toHaveBeenCalled();
  });
});
