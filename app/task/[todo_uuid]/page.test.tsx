import { cleanup, render, screen } from '@testing-library/react';
import {
  MockInstance,
  afterEach,
  beforeEach,
  describe,
  it,
  vi,
  expect,
} from 'vitest';

import useSWR from 'swr';

import TaskPage from './page';
import { PathParam } from '@/app/types';
import userEvent from '@testing-library/user-event';
import { TASK_API_PATH } from '../../util';
import toast from 'react-hot-toast';

vi.mock('swr', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
  Toaster: () => <div></div>,
}));

const mockContext: PathParam = {
  params: { todo_uuid: 'fake_uuid' },
};

const mockTodo = { title: 'Test Todo' };

describe('Task Page', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    (useSWR as unknown as MockInstance).mockImplementation((key) => {
      if (key.includes('todo')) {
        return { data: mockTodo, error: null, isLoading: false };
      }
      return { data: null, error: null, isLoading: true };
    });
  });

  it('should renders correctly and loads initial todo', async () => {
    render(<TaskPage {...mockContext} />);
    expect(screen.getByText(mockTodo.title)).toBeDefined();
    expect(useSWR).toHaveBeenCalledWith(
      `${TASK_API_PATH}/${mockContext.params.todo_uuid}`,
      expect.any(Function),
    );
  });

  it('should renders correctly and loads tasks', async () => {
    useSWR as unknown as MockInstance;
    render(<TaskPage {...mockContext} />);
    console.log(screen.getByRole('heading').innerHTML);
    expect(screen.getByRole('heading', { level: 1 }).innerHTML).toEqual(
      mockTodo.title,
    );
  });

  it('allows users to start creating a task', async () => {
    render(<TaskPage {...mockContext} />);
    await userEvent.click(screen.getByText('+'));
    expect(screen.getByPlaceholderText('Type new Task here')).toBeDefined();
  });

  it('should displays an error message when data fetching fails', async () => {
    (useSWR as unknown as MockInstance).mockReturnValue({
      data: null,
      error: 'Fetch error',
      isLoading: false,
    });
    render(<TaskPage {...mockContext} />);
    expect(toast.error).toHaveBeenCalledWith('Fetch error');
  });
});
