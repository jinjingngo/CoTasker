import useSWR from 'swr';

import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  MockInstance,
} from 'vitest';
import { renderHook, act, cleanup, waitFor } from '@testing-library/react';

import { TodoProvider, TodoProviderContext } from './TodoProvider';
import { ReactNode, useContext } from 'react';
import { Todo } from '@/shared/schemas';

vi.mock('swr', () => ({
  __esModule: true,
  default: vi.fn(),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <TodoProvider>{children}</TodoProvider>
);

describe('TodoProvider', () => {
  beforeEach(() => {
    (useSWR as unknown as MockInstance).mockReturnValue({
      data: { todo: [], total: 0 },
      error: null,
      isLoading: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('initial state is correct', () => {
    const { result } = renderHook(() => useContext(TodoProviderContext), {
      wrapper,
    });
    expect(result.current.todos).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles data fetching and state updates correctly', async () => {
    const mockData = {
      todo: [{ id: 1, title: 'Test Todo' }],
      total: 1,
    };

    (useSWR as unknown as MockInstance).mockReturnValue({
      data: mockData,
      error: null,
      isLoading: false,
    });

    const { result } = renderHook(() => useContext(TodoProviderContext), {
      wrapper,
    });
    await waitFor(() => {
      expect(result.current.todos).toHaveLength(1);
      expect(result.current.total).toBe(1);
      expect(result.current.hasMore).toBeFalsy();
      expect(result.current.todos[0].title).toEqual('Test Todo');
    });
  });

  it('handles loading more items', async () => {
    const mockData = {
      todo: [
        { id: 1, title: 'Test Todo' },
        { id: 2, title: 'Another Test Todo' },
      ],
      total: 5,
    };

    (useSWR as unknown as MockInstance).mockReturnValue({
      data: mockData,
      error: null,
      isLoading: false,
    });

    const { result } = renderHook(() => useContext(TodoProviderContext), {
      wrapper,
    });

    await waitFor(() => {
      result.current.loadMore();

      expect(result.current.todos).toHaveLength(2);
      expect(result.current.hasMore).toBe(true);
    });
  });
});
