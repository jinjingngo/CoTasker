import Link from 'next/link';
import toast from 'react-hot-toast';

import { TODO_API_PATH } from '../../util';

import type { Todo } from '@/shared/schemas';
import type { APIResponseType, MutateTodoResponse } from '@/app/types';
import { useState } from 'react';
import TodoForm from '../TodoForm';

type TodoProps = {
  todo: Todo;
  deleteTodo: (todo: Todo) => void;
  updateTodo: (todo: Todo) => void;
};

const Todo = ({ todo, deleteTodo, updateTodo }: TodoProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const deleteHandler = async () => {
    try {
      const response = await fetch(`${TODO_API_PATH}/${todo.uuid}`, {
        method: 'DELETE',
      });
      const result = (await response.json()) as APIResponseType;
      if (result.error) {
        toast.error(result.error);
        return;
      }
      console.log({ result });
      toast.success('Updated');
      deleteTodo(todo);
    } catch (error) {
      console.error(error);
      toast.error('Some error happens!');
    }
  };

  const editHandler = () => {
    setIsEditing(true);
  };

  const terminateEditingTodo = () => setIsEditing(false);

  const saveTodo = async (title: string) => {
    try {
      const response = await fetch(`${TODO_API_PATH}/${todo.uuid}`, {
        method: 'PATCH',
        body: JSON.stringify({ title }),
      });
      const result = (await response.json()) as MutateTodoResponse;
      const { error } = result;
      if (error) {
        toast.error(error);
        return;
      }
      if (!result) return;
      updateTodo(result);
      toast.success('New Todo Created!');
      terminateEditingTodo();
    } catch (e) {
      console.error(e);
      toast.error('Some error happens!');
    }
  };

  return isEditing ? (
    <TodoForm close={terminateEditingTodo} save={saveTodo} todo={todo} />
  ) : (
    <li className='group flex w-full items-center justify-between border-[1px] border-solid border-[salmon] px-4 py-2'>
      <Link href={`/task/${todo.uuid}`}>
        <p>{todo.title}</p>
      </Link>
      <div className='hidden w-24 items-center justify-between group-hover:flex'>
        <button onClick={editHandler} className='hover:text-red-700'>
          Edit
        </button>
        <button onClick={deleteHandler} className='hover:text-[salmon]'>
          Delete
        </button>
      </div>
    </li>
  );
};

export default Todo;
