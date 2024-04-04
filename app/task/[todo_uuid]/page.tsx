'use client';

import useSWR from 'swr';
import toast, { Toaster } from 'react-hot-toast';
import { useCallback, useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import {
  TASK_API_PATH,
  TODO_API_PATH,
  fetcher,
  mergeArrays,
  replaceItem,
  sortByIdDesc,
} from '../../util';

import TaskForm from '../../component/TaskForm';
import Task from '../../component/Task';

import type {
  MutateTaskResponse,
  PathParam,
  SingleTodoQueryResult,
  TaskCreate,
  TasksQueryResult,
} from '@/app/types';

import type { Task as TaskType } from '@/shared/schemas';
import { Command, StreamPayload } from '@/shared/types';

const TaskPage = ({ params }: PathParam) => {
  const { todo_uuid } = params;
  const { data: todo, error: todoError } = useSWR<SingleTodoQueryResult>(
    `${TODO_API_PATH}/${todo_uuid}`,
    fetcher,
  );

  const {
    data: taskList,
    error: tasksError,
    isLoading,
  } = useSWR<TasksQueryResult>(`${TASK_API_PATH}/${todo_uuid}`, fetcher);

  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!taskList) return;
    setTasks((currentTasks) => {
      const unshiftedTasks = mergeArrays(currentTasks, taskList).sort(
        sortByIdDesc,
      );
      return unshiftedTasks;
    });
    // No need to `tasks` dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskList]);

  useEffect(() => {
    if (!todoError && !tasksError) return;
    toast.error(todoError || tasksError);
  }, [todoError, tasksError]);

  useEffect(() => {
    if (isLoading) {
      toast.loading('Loading...', { id: 'loading' });
      return;
    }
    toast.dismiss();
  }, [isLoading]);

  const [isCreating, setIsCreating] = useState(false);

  const url = `${process.env.NEXT_PUBLIC_WS_URL}/ws/${todo_uuid}`;
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(url, {
    onOpen: () => console.log('opened'),
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: (closeEvent) => {
      console.log(closeEvent);
      return true;
    },
    reconnectAttempts: 10,
  });

  const startCreatingTask = () => {
    if (isCreating) return;
    setIsCreating(true);
  };

  const terminateCreatingTask = () => setIsCreating(false);

  const createTask = async (task: TaskCreate) => {
    if (!todo?.uuid) return;
    try {
      const response = await fetch(`${TASK_API_PATH}/${todo.uuid}`, {
        method: 'POST',
        body: JSON.stringify({ ...task, status: 'IN_PROGRESS' }),
      });
      const result = (await response.json()) as MutateTaskResponse;
      const { error } = result;
      if (error) {
        toast.error(error);
        return;
      }
      if (!result) return;

      setTasks((tasks) => [result, ...tasks]);
      toast.success('New Task Created!');
      sendTaskToStreamer(result, 'CREATED_TASK');
      terminateCreatingTask();
    } catch (e) {
      console.error(e);
      toast.error('Some error happens!');
    }
  };

  const sendTaskToStreamer = useCallback(
    (task: TaskType, cmd: Command) => {
      if (readyState !== ReadyState.OPEN) return;
      const streamPayload: StreamPayload = {
        cmd,
        payload: {
          todo_uuid,
          task,
        },
      };
      sendJsonMessage(streamPayload);
    },
    [readyState, sendJsonMessage, todo_uuid],
  );

  /**
   * eject a task, and decrease the number locally
   * @param {TaskType} todo
   * @returns {void}
   */
  const deleteTask = (task: TaskType) => {
    setTasks((currentTasks) => currentTasks.filter(({ id }) => task.id !== id));
  };

  /**
   * mutate a task and remain the same index as it was
   * @param {TaskType} todo
   */
  const updateTask = (task: TaskType) => {
    setTasks((currentTask) => replaceItem<Task>(currentTask, task, 'id'));
  };

  useEffect(() => {
    if (!lastJsonMessage) return;
    const { cmd, payload } = lastJsonMessage as StreamPayload;
    const { task } = payload;
    if (!task) return;
    if (cmd === 'CREATED_TASK') {
      setTasks((tasks) => [task as TaskType, ...tasks]);
      return;
    }

    if (cmd === 'DELETED_TASK') {
      deleteTask(task as TaskType);
      return;
    }

    if (cmd === 'UPDATING_TASK') {
      updateTask(task as TaskType);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <Toaster position='top-center' reverseOrder={false} />
      <ul className='relative flex w-1/3 list-none flex-col gap-1'>
        <li className='flex w-full items-center justify-center rounded-t-lg border-[1px] border-solid border-[salmon] px-4 py-2'>
          {todo ? <h1>{todo.title}</h1> : <></>}
          <button
            className='absolute right-2 disabled:cursor-not-allowed disabled:text-gray-400'
            onClick={startCreatingTask}
            disabled={isCreating}
          >
            +
          </button>
        </li>
        {(!tasks || !tasks.length) && !isCreating && (
          <li className='flex w-full items-center justify-center border-[1px] px-4 py-2 text-gray-400'>
            No tasks, click + to create one.
          </li>
        )}
        {isCreating && (
          <TaskForm close={terminateCreatingTask} save={createTask} />
        )}
        {todo &&
          tasks &&
          tasks.length > 0 &&
          tasks.map((task) => (
            <Task
              key={task.id}
              task={task}
              todo={todo}
              broadcast={sendTaskToStreamer}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        {tasks && tasks.length > 0 && (
          <li className='flex w-full items-center justify-between rounded-b-lg border-[1px] border-solid border-[salmon] px-4  py-2'>
            {`Count: ${tasks.length}`}
          </li>
        )}
      </ul>
    </main>
  );
};

export default TaskPage;
