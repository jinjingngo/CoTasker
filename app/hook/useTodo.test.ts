import useSWR from 'swr';

import {
  describe,
  it,
  expect,
  vi,
  MockInstance,
  beforeEach,
  afterEach,
} from 'vitest';
import { renderHook, waitFor, cleanup } from '@testing-library/react';

import useTodo from './useTodo';

vi.mock('swr', () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe('useTodo hook', () => {
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

  it('initial state', async () => {
    const { result } = renderHook(() => useTodo());
    expect(result.current.todos).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('loads todos when data is fetched', async () => {
    const mockData = {
      todo: [{ id: 1, title: 'Test Todo' }],
      total: 1,
    };

    (useSWR as unknown as MockInstance).mockReturnValue({
      data: mockData,
      error: null,
      isLoading: false,
    });

    const { result } = renderHook(() => useTodo());
    await waitFor(() => {
      expect(result.current.todos).toHaveLength(1);
      expect(result.current.total).toBe(1);
      expect(result.current.hasMore).toBe(false);
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

    const { result } = renderHook(() => useTodo());

    await waitFor(() => {
      result.current.loadMore();

      expect(result.current.todos).toHaveLength(2);
      expect(result.current.hasMore).toBe(true);
    });
  });
});
