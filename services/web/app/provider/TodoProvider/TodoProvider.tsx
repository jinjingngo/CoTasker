import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from 'react';
import useSWR from 'swr';

import { TODO_API_PATH, fetcher, mergeArrays, sortByIdDesc } from '../../util';

import type { TodoQueryResult } from '../../types';
import type { Todo } from '@/shared/schemas';

type TodoProviderContextType = {
  todos: Todo[];
  setTodos: Dispatch<SetStateAction<Todo[]>>;
  total: number;
  setTotal: Dispatch<SetStateAction<number>>;
  hasMore: boolean;
  loadMore: () => void;
  error: any;
  isLoading: boolean;
};

type TodoProviderType = {
  children: ReactNode;
};

export const TodoProviderContext = createContext<TodoProviderContextType>({
  todos: [],
  setTodos: () => null,
  total: 0,
  setTotal: () => null,
  hasMore: false,
  loadMore: () => null,
  error: '',
  isLoading: false,
});

const PAGE_LIMIT = 5;

export const TodoProvider = ({ children }: TodoProviderType) => {
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

  const value = {
    todos,
    setTodos,
    total,
    setTotal,
    hasMore,
    loadMore,
    error,
    isLoading,
  };

  return (
    <TodoProviderContext.Provider value={value}>
      {children}
    </TodoProviderContext.Provider>
  );
};
