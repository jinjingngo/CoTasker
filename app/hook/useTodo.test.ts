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

  it('should render as expected', async () => {
    const { result } = renderHook(() => useTodo());
    expect(result.current.todos).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});
