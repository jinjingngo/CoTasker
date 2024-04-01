import { FormEvent, MouseEvent, ChangeEvent, useState } from 'react';

import type { Todo } from '@/shared/schemas';

type TodoFormProps = {
  todo?: Todo;
  close: () => void;
  save: (_: string) => void;
};

const TodoForm = ({ todo, close, save }: TodoFormProps) => {
  const [title, setTitle] = useState(todo ? todo.title : '');

  const cancelHandler = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    close();
  };

  const submitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title) return;
    save(title);
  };

  const changeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  return (
    <form
      onSubmit={submitHandler}
      className='flex flex-col items-center justify-center gap-1 px-4 py-2'
    >
      <input
        className='w-full border-b-[1px] border-[salmon] bg-transparent outline-none'
        type='text'
        placeholder='Type new Todo here'
        name='title'
        id='title'
        value={title}
        onChange={changeHandler}
      />
      <div className='flex gap-4'>
        <button
          className='w-[3.25rem] border-b-[1px] hover:border-[salmon]'
          onClick={cancelHandler}
        >
          Cancel
        </button>
        <button
          className='w-[3.25rem] border-b-[1px] hover:border-[salmon]'
          type='submit'
        >
          Ok
        </button>
      </div>
    </form>
  );
};

export default TodoForm;
