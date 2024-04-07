import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

import { TASK_API_PATH, sortByUpdatedDateDesc } from '../../util';

import { TaskForm } from '..';

import type { Status, Task as TaskType, Todo } from '@/shared/schemas';
import type {
  APIResponseType,
  MutateTaskResponse,
  TaskCreate,
  TaskTree,
} from '@/app/types';
import type { Command } from '@/shared/types';

type TaskProps = {
  task: TaskTree;
  todo: Todo;
  deleteTask: (task: TaskType) => void;
  updateTask: (task: TaskType) => void;
  broadcast: (task: TaskType, cmd: Command) => void;
  addSubTask?: (parentID?: number) => void;
};

const Task = ({
  task,
  todo,
  deleteTask,
  updateTask,
  broadcast,
  addSubTask,
}: TaskProps) => {
  const [currentTask, setCurrentTask] = useState<TaskType>(task);

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

  const addHandler = () => {
    const { id } = task;
    addSubTask?.(id);
  };

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

  const changeHandler = ({ title, notes }: TaskType) => {
    broadcast({ ...task, title, notes }, 'UPDATING_TASK');
  };

  const setIsDoneHandler = () => {
    const notDoneChildren = task.children.find(
      ({ status }) => status === 'IN_PROGRESS',
    );

    if (notDoneChildren) {
      toast.error('Finish all subtask first');
      return;
    }

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
    <li className='group grid w-full grid-cols-[1.25rem_1fr_auto] items-center justify-start gap-2 border-[1px] border-solid border-[salmon] px-4 py-2'>
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
      <div
        className={`${task.children.length > 0 ? 'w-16' : 'w-32'} invisible flex flex-shrink-0 flex-grow-0 items-center justify-between group-hover:visible`}
      >
        <button onClick={addHandler} className='hover:text-red-700'>
          Add
        </button>
        <button onClick={editHandler} className='hover:text-red-700'>
          Edit
        </button>
        {task.children.length === 0 && (
          <button onClick={deleteHandler} className='hover:text-[salmon]'>
            Delete
          </button>
        )}
      </div>
      {task.children.length > 0 && (
        <>
          <ul className='relative col-span-3 flex w-full list-none flex-col gap-1'>
            {task.children.map((t) => (
              <Task
                key={t.id}
                task={t}
                todo={todo}
                broadcast={broadcast}
                deleteTask={deleteTask}
                updateTask={updateTask}
                addSubTask={addSubTask}
              />
            ))}
          </ul>
        </>
      )}
    </li>
  );
};

export default Task;
