import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  MockInstance,
} from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoPage from './page';
import useSWR from 'swr';
import toast from 'react-hot-toast';

vi.mock('swr', () => ({
  __esModule: true,
  default: vi.fn(),
}));

global.fetch = vi.fn();

vi.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
  Toaster: () => <div></div>,
}));

describe('TodoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useSWR as unknown as MockInstance).mockReturnValue({
      data: { todo: [], total: 0 },
      error: null,
      isLoading: false,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('should renders correctly and loads initial todo', async () => {
    render(<TodoPage />);
    expect(screen.getByText('CoTasker')).toBeDefined();
    expect(useSWR).toHaveBeenCalledWith(
      `/api/todo?offset=0&limit=5`,
      expect.any(Function),
    );
  });

  it('should allows creating a new todo', async () => {
    render(<TodoPage />);
    await userEvent.click(screen.getByText('+'));
    expect(screen.getByPlaceholderText('Type new Todo here')).toBeDefined();
  });

  it('should loads more todos on button click', async () => {
    const todos = [
      { id: 1, title: 'Todo #1' },
      { id: 2, title: 'Todo #1' },
    ];
    (useSWR as unknown as MockInstance).mockReturnValue({
      data: {
        todo: [...todos],
        total: 10,
      },
      error: null,
      isLoading: false,
    });
    render(<TodoPage />);
    await userEvent.click(screen.getByText('Load more'));
    expect(useSWR).toHaveBeenCalledWith(
      `/api/todo?offset=2&limit=5`,
      expect.any(Function),
    );
  });

  it('should displays an error message when data fetching fails', async () => {
    (useSWR as unknown as MockInstance).mockReturnValue({
      data: null,
      error: 'Fetch error',
      isLoading: false,
    });
    render(<TodoPage />);
    expect(toast.error).toHaveBeenCalledWith('Fetch error');
  });
});
