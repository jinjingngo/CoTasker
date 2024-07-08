import useSWR from 'swr';
import { describe, it, expect, vi, beforeEach, MockInstance } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTask } from './useTask';
import { mergeArrays, sortByIdDesc } from '../util';

vi.mock('swr', () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe('useTask', () => {
  const todo_uuid = 'test-uuid';

  beforeEach(() => {});

  it('initially returns an empty tasks array and isLoading true', () => {
    (useSWR as unknown as MockInstance).mockReturnValue({
      data: [],
      error: null,
      isLoading: true,
    });

    const { result } = renderHook(() => useTask(todo_uuid));
    expect(result.current.tasks).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('sets tasks when data is fetched', async () => {
    const mockTasks = [
      {
        id: 2,
        title: 'Task 2',
        updated_date: new Date('2021-01-02'),
      },
      {
        id: 3,
        title: 'Task 3',
        updated_date: new Date('2021-01-03'),
      },
    ];
    (useSWR as unknown as MockInstance).mockReturnValue({
      data: mockTasks,
      error: null,
      isLoading: false,
    });

    const { result } = renderHook(() => useTask(todo_uuid));
    expect(result.current.tasks).toEqual(mockTasks.sort((a, b) => b.id - a.id));
  });

  it.todo('handles errors correctly', () => {
    const mockError = new Error('Network error');
    (useSWR as unknown as MockInstance).mockReturnValueOnce({
      data: null,
      error: mockError,
      isLoading: false,
    });

    const { result } = renderHook(() => useTask(todo_uuid));
    expect(result.current.error).toEqual(mockError);
  });
});
