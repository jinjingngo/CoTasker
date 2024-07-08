import useSWR from 'swr';

import { useContext } from 'react';

import { TodoProviderContext } from '../provider';

import { TODO_API_PATH, fetcher } from '../util';

import type { SingleTodoQueryResult } from '../types';

export const useTodo = () => {
  return useContext(TodoProviderContext);
};

export const useSingleTodo = (todo_uuid: string) => {
  const { data, error } = useSWR<SingleTodoQueryResult>(
    `${TODO_API_PATH}/${todo_uuid}`,
    fetcher,
  );

  return { todo: data, error };
};
