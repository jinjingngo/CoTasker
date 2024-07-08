import { FormEvent, MouseEvent, ChangeEvent, useState, useEffect } from 'react';

import type { Task } from '@/shared/schemas';
import type { TaskCreate } from '@/app/types';

type TaskFormProps = {
  task?: Task;
  parentTaskID?: number;
  close: () => void;
  save: (_: TaskCreate) => void;
  change?: (_: Task) => void;
};

const TaskForm = ({
  task,
  parentTaskID,
  close,
  save,
  change,
}: TaskFormProps) => {
  const [currentTask, setCurrentTask] = useState({
    title: task?.title || '',
    notes: task?.notes || '',
  });

  useEffect(() => {
    if (!task) return;
    const { title, notes = '' } = task;
    setCurrentTask({ title, notes: notes as string });
  }, [task]);

  const cancelHandler = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    close();
  };

  const submitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentTask.title) return;
    save({
      ...currentTask,
      ...(parentTaskID ? { parent_id: parentTaskID } : undefined),
    });
  };

  const changeHandler =
    (key: 'title' | 'notes') =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCurrentTask((currentTask) => {
        const task = {
          ...currentTask,
          [key]: event.target.value,
        };
        change?.(task as Task);
        return task;
      });
    };

  return (
    <form
      onSubmit={submitHandler}
      className='flex flex-col items-center justify-center gap-1 px-4 py-2'
    >
      <input
        className='w-full border-b-[1px] border-[salmon] bg-transparent outline-none'
        type='text'
        placeholder={`Type new ${parentTaskID === undefined || parentTaskID === null ? '' : 'Sub '}Task here`}
        name='title'
        id='title'
        value={currentTask.title}
        onChange={changeHandler('title')}
      />
      <textarea
        className='w-full border-b-[1px] border-[salmon] bg-transparent outline-none'
        placeholder='Notes (optional)'
        name='notes'
        id='notes'
        rows={1}
        value={currentTask.notes || ''}
        onChange={changeHandler('notes')}
      ></textarea>
      <div className='flex gap-4'>
        <button
          type='button'
          className='w-[3.25rem] border-b-[1px] hover:border-[salmon]'
          onClick={cancelHandler}
        >
          Close
        </button>
        <button
          type='submit'
          className='w-[3.25rem] border-b-[1px] hover:border-[salmon]'
        >
          Ok
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
