import useSWR from 'swr';
import { useEffect, useState } from 'react';

import { TODO_API_PATH, fetcher, mergeArrays, sortByIdDesc } from '../util';

import type { TodoQueryResult } from '../types';
import type { Todo } from '@/shared/schemas';

const PAGE_LIMIT = 5;

export const useTodo = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const { data, error, isLoading } = useSWR<TodoQueryResult>(
    `${TODO_API_PATH}?offset=${offset}&limit=${PAGE_LIMIT}`,
    fetcher,
  );

  const loadMore = () => {
    if (!hasMore) return;
    setOffset(() => todos.length);
  };

  useEffect(() => {
    if (!data) return;
    const { todo = [], total = 0 } = data;
    setTodos((currentTodos) => {
      const unshiftedTodos = mergeArrays(currentTodos, todo).sort(sortByIdDesc);
      setHasMore(total - unshiftedTodos.length > 0);
      return unshiftedTodos;
    });
    setTotal(() => total);
  }, [data]);

  return {
    todo: todos,
    setTodo: setTodos,
    total,
    setTotal,
    hasMore,
    loadMore,
    error,
    isLoading,
  };
};
