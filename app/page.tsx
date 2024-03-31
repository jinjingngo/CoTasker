'use client';

import useSWR from 'swr';
import union from 'lodash/fp/union';
import sortBy from 'lodash/fp/sortBy';
import toast, { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';

import TodoForm from './component/TodoForm';
import Todo from './component/Todo';

import { TODO_API_PATH, fetcher, replaceItem } from './util';
import { MutateTodoResponse, TodoQueryResult } from './types';

const PAGE_LIMIT = 5;

const sortTodoByIdDesc = (a: Todo, z: Todo) => z.id - a.id;

const TodoPage = () => {
  const [todo, setTodo] = useState<Todo[]>([]);
  const [total, setTotal] = useState(0);

  // `hasMore` indicate if we can load more
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const [isCreating, setIsCreating] = useState(false);

  const { data, error, isLoading } = useSWR<TodoQueryResult>(
    `/api/todo?offset=${offset}&limit=${PAGE_LIMIT}`,
    fetcher,
  );

  const startCreatingTodo = () => {
    if (isCreating) return;
    setIsCreating(true);
  };

  const terminateCreatingTodo = () => setIsCreating(false);

  /**
   * load more todos if available
   * @returns {void}
   */
  const loadMore = () => {
    if (!hasMore) return;
    setOffset(() => todo.length);
  };

  const createTodo = async (title: string) => {
    try {
      const response = await fetch(TODO_API_PATH, {
        method: 'POST',
        body: JSON.stringify({ title }),
      });
      const result = (await response.json()) as MutateTodoResponse;
      const { error } = result;
      if (error) {
        toast.error(error);
        return;
      }
      if (!result) return;
      setTodo((currentTodo) => [result, ...currentTodo]);
      setTotal((currentTotal) => currentTotal + 1);
      toast.success('New Todo Created!');
      terminateCreatingTodo();
    } catch (e) {
      console.error(e);
      toast.error('Some error happens!');
    }
  };

  /**
   * eject a todo, and decrease the number locally
   * @param {Todo} todo
   * @returns {void}
   */
  const deleteTodo = (todo: Todo) => {
    setTodo((currentTodo) => currentTodo.filter(({ id }) => todo.id !== id));
    setTotal((currentTotal) => currentTotal - 1);
  };

  /**
   * mutation a todo and remain the same index as it was
   * @param {Todo} todo
   */
  const updateTodo = (todo: Todo) => {
    setTodo((currentTodo) => replaceItem<Todo>(currentTodo, todo, 'id'));
  };

  useEffect(() => {
    if (!data) return;
    const { todo = [], total = 0 } = data;
    setTodo((currentTodo) => {
      // TODO: causing duplicated key issue when update todo, investigate the `union` further
      const unshiftedTodo = union(currentTodo, todo).sort(sortTodoByIdDesc);
      setHasMore(total - unshiftedTodo.length > 0);
      return unshiftedTodo;
    });
    setTotal(() => total);
  }, [data]);

  useEffect(() => {
    if (!error) return;
    toast.error(error);
  }, [error]);

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <Toaster position='top-center' reverseOrder={false} />
      <ul className='relative flex w-1/3 list-none flex-col gap-1'>
        <li className='flex w-full items-center justify-center rounded-t-lg border-[1px] border-solid border-[salmon] px-4 py-2'>
          <h1>CoTasker</h1>
          <button
            className='absolute right-2 disabled:cursor-not-allowed disabled:text-gray-400'
            onClick={startCreatingTodo}
            disabled={isCreating}
          >
            +
          </button>
        </li>
        {isCreating && (
          <TodoForm close={terminateCreatingTodo} save={createTodo} />
        )}
        {todo.length > 0 &&
          todo.map((todo) => (
            <Todo
              key={todo.id}
              todo={todo}
              deleteTodo={deleteTodo}
              updateTodo={updateTodo}
            />
          ))}
        {todo.length > 0 && (
          <li className='flex w-full items-center justify-between rounded-b-lg border-[1px] border-solid border-[salmon] px-4  py-2'>
            <div>
              {todo.length} / {total}
            </div>
            <button
              className='disabled:cursor-not-allowed disabled:text-gray-400'
              disabled={isLoading || !hasMore}
              onClick={loadMore}
            >
              Load more
            </button>
          </li>
        )}
      </ul>
    </main>
  );
};

export default TodoPage;
