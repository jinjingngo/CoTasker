import { useEffect, useState } from 'react';

import { TASK_API_PATH } from '../../util';

import type { Status, Task, Todo } from '@/shared/schemas';
import type {
  APIResponseType,
  MutateTaskResponse,
  TaskCreate,
} from '@/app/types';
import toast from 'react-hot-toast';
import TaskForm from '../TaskForm';
import { Command } from '@/shared/types';

type TaskProps = {
  task: Task;
  todo: Todo;
  deleteTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  broadcast: (task: Task, cmd: Command) => void;
};

const Task = ({ task, todo, deleteTask, updateTask, broadcast }: TaskProps) => {
  const [currentTask, setCurrentTask] = useState<Task>(task);

  const [isEditing, setIsEditing] = useState(false);
  const [isDone, setIsDone] = useState(() => currentTask.status === 'DONE');

  useEffect(() => {
    if (!task) return;
    setCurrentTask(task);
    setIsDone(task.status === 'DONE');
  }, [task]);

  const deleteHandler = async () => {
    try {
      const response = await fetch(
        `${TASK_API_PATH}/${todo.uuid}/${currentTask.id}`,
        {
          method: 'DELETE',
        },
      );
      const result = (await response.json()) as APIResponseType;
      if (result.error) {
        toast.error(result.error);
        return;
      }
      broadcast(currentTask, 'DELETED_TASK');
      toast.success('Deleted');
      deleteTask(task);
    } catch (error) {
      console.error(error);
      toast.error('Some error happens!');
    }
  };

  const editHandler = () => {
    setIsEditing(true);
  };

  const terminateEditingTask = () => setIsEditing(false);

  const saveTask = async (updatedTask: TaskCreate) => {
    try {
      const response = await fetch(
        `${TASK_API_PATH}/${todo.uuid}/${currentTask.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updatedTask),
        },
      );
      const result = (await response.json()) as MutateTaskResponse;
      const { error } = result;
      if (error) {
        toast.error(error);
        return;
      }
      if (!result) return;
      broadcast(result, 'UPDATING_TASK');
      toast.success('Updated!');
      updateTask(result);
      isEditing && terminateEditingTask();
    } catch (e) {
      console.error(e);
      toast.error('Some error happens!');
    }
  };

  const changeHandler = ({ title, notes }: Task) => {
    broadcast({ ...task, title, notes }, 'UPDATING_TASK');
  };

  const setIsDoneHandler = () => {
    const status: Status = !isDone ? 'DONE' : 'IN_PROGRESS';
    setIsDone((isDone) => !isDone);
    saveTask({ ...currentTask, status });
  };

  return isEditing ? (
    <TaskForm
      task={currentTask}
      close={terminateEditingTask}
      save={saveTask}
      change={changeHandler}
    />
  ) : (
    <li className='group flex w-full items-center justify-start gap-2 border-[1px] border-solid border-[salmon] px-4 py-2'>
      <input
        className='grid h-5 w-5 appearance-none place-content-center rounded border-[1px] border-gray-400 bg-transparent before:h-3 before:w-3 before:scale-0 before:rounded before:bg-[salmon] before:content-[""] checked:before:scale-100'
        type='checkbox'
        name='done'
        checked={isDone}
        onChange={setIsDoneHandler}
      />
      <div className='flex-1 group-hover:pr-1'>
        <p className={isDone ? 'line-through decoration-solid' : ''}>
          {currentTask.title}
        </p>
        {currentTask.notes && (
          <p
            className={`border-t-[1px] border-[salmon] text-gray-700 ${isDone ? 'line-through decoration-solid' : ''}`}
          >
            {currentTask.notes}
          </p>
        )}
      </div>
      <div className='hidden w-24 flex-shrink-0 flex-grow-0 items-center justify-between group-hover:flex'>
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

export default Task;
