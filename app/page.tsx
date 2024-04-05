'use client';

import useSWR from 'swr';
import { useEffect, useState } from 'react';

import TodoForm from './component/TodoForm';
import { Todo, AddButton, CoToaster } from './component';

import { useTodo } from './hook/useTodo';

import { TODO_API_PATH, replaceItem } from './util';

import type { MutateTodoResponse } from './types';
import type { Todo as TodoType } from '@/shared/schemas';

const TodoPage = () => {
  const {
    todos,
    setTodos,
    total,
    setTotal,
    hasMore,
    loadMore,
    error,
    isLoading,
  } = useTodo();

  const [isCreating, setIsCreating] = useState(false);

  const startCreatingTodo = () => {
    if (isCreating) return;
    setIsCreating(true);
  };

  const terminateCreatingTodo = () => setIsCreating(false);

  const createTodo = async (title: string) => {
    try {
      const response = await fetch(TODO_API_PATH, {
        method: 'POST',
        body: JSON.stringify({ title }),
      });
      const result = (await response.json()) as MutateTodoResponse;
      const { error } = result;
      if (error) {
        CoToaster.error(error);
        return;
      }
      if (!result) return;
      setTodos((currentTodo) => [result, ...currentTodo]);
      setTotal((currentTotal) => currentTotal + 1);
      CoToaster.success('New Todo Created!');
      terminateCreatingTodo();
    } catch (e) {
      console.error(e);
      CoToaster.error('Some error happens!');
    }
  };

  /**
   * eject a todo, and decrease the number locally
   * @param {TodoType} todo
   * @returns {void}
   */
  const deleteTodo = (todo: TodoType) => {
    setTodos((currentTodo) => currentTodo.filter(({ id }) => todo.id !== id));
    setTotal((currentTotal) => currentTotal - 1);
  };

  /**
   * mutation a todo and remain the same index as it was
   * @param {TodoType} todo
   */
  const updateTodo = (todo: TodoType) => {
    setTodos((currentTodo) => replaceItem<TodoType>(currentTodo, todo, 'id'));
  };

  useEffect(() => {
    if (!error) return;
    CoToaster.error(error);
  }, [error]);

  useEffect(() => {
    if (isLoading) {
      CoToaster.loading('Loading...');
      return;
    }
    CoToaster.dismiss();
  }, [isLoading]);

  return (
    <main className='flex min-h-screen flex-col items-center p-12 md:px-24'>
      <CoToaster.Toaster position='top-center' reverseOrder={false} />
      <ul className='relative flex w-full list-none flex-col gap-1 md:w-[85%] lg:w-[70%] xl:w-[50%]'>
        <li className='flex w-full items-center justify-center rounded-t-lg border-[1px] border-solid border-[salmon] px-4 py-2'>
          <h1>CoTasker</h1>
          <AddButton
            className='absolute right-2'
            onClick={startCreatingTodo}
            disabled={isCreating}
          >
            + Add Todo
          </AddButton>
        </li>
        {isCreating && (
          <TodoForm close={terminateCreatingTodo} save={createTodo} />
        )}
        {todos.length > 0 &&
          todos.map((todo) => (
            <Todo
              key={todo.id}
              todo={todo}
              deleteTodo={deleteTodo}
              updateTodo={updateTodo}
            />
          ))}
        {todos.length > 0 && (
          <li className='flex w-full items-center justify-between rounded-b-lg border-[1px] border-solid border-[salmon] px-4  py-2'>
            <div>
              {todos.length} / {total}
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
