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

import { useTodo, useSingleTodo } from './useTodo';

vi.mock('swr', () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe('useTodo', () => {
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

  describe('useSingleTodo hook', () => {
    const todoUUID = 'unique-todo-id';
    const mockTodo = {
      id: todoUUID,
      title: 'Learn Vitest',
      completed: false,
    };

    beforeEach(() => {
      (useSWR as unknown as MockInstance).mockReturnValue({
        data: mockTodo,
        error: null,
      });
    });

    it('returns todo data when successful', () => {
      const { result } = renderHook(() => useSingleTodo(todoUUID));
      expect(result.current.todo).toEqual(mockTodo);
      expect(result.current.error).toBeNull();
    });

    it('handles errors correctly', () => {
      const mockError = new Error('Failed to fetch');
      (useSWR as unknown as MockInstance).mockReturnValue({
        data: null,
        error: mockError,
      });
      const { result } = renderHook(() => useSingleTodo(todoUUID));
      expect(result.current.todo).toBeNull();
      expect(result.current.error).toEqual(mockError);
    });
  });
});
