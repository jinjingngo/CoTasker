'use client';

import useSWR from 'swr';
import isEqual from 'lodash/fp/isEqual';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useCallback, useEffect, useState } from 'react';

import {
  TASK_API_PATH,
  TODO_API_PATH,
  fetcher,
  mergeArrays,
  replaceItem,
  sortByIdDesc,
} from '../../util';

import {
  TaskForm,
  Task,
  AddButton,
  useStatusFilter,
  CoToaster,
} from '../../component';

import type {
  MutateTaskResponse,
  PathParam,
  SingleTodoQueryResult,
  TaskCreate,
  TasksQueryResult,
} from '@/app/types';

import type { Task as TaskType } from '@/shared/schemas';
import type { Command, StreamPayload } from '@/shared/types';

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

  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const { filteringStatus, Filter } = useStatusFilter();

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
    CoToaster.error(todoError || tasksError);
  }, [todoError, tasksError]);

  useEffect(() => {
    if (isLoading) {
      CoToaster.loading('Loading...');
      return;
    }
    CoToaster.dismiss();
  }, [isLoading]);

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
    if (isCreatingTask) return;
    setIsCreatingTask(true);
  };

  const terminateCreatingTask = () => setIsCreatingTask(false);

  const createTask = async (task: TaskCreate) => {
    if (!todo?.uuid) return;
    try {
      CoToaster.loading('Creating...');
      const response = await fetch(`${TASK_API_PATH}/${todo.uuid}`, {
        method: 'POST',
        body: JSON.stringify({ ...task, status: 'IN_PROGRESS' }),
      });
      const result = (await response.json()) as MutateTaskResponse;
      const { error } = result;
      if (error) {
        CoToaster.error(error);
        return;
      }
      if (!result) return;

      setTasks((tasks) => [result, ...tasks]);
      CoToaster.success('New Task Created!');
      sendTaskToStreamer(result, 'CREATED_TASK');
      terminateCreatingTask();
    } catch (e) {
      console.error(e);
      CoToaster.error('Some error happens!');
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
    setTasks((currentTask) => replaceItem<TaskType>(currentTask, task, 'id'));
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
    <main className='flex min-h-screen flex-col items-center p-12 md:px-24'>
      <CoToaster.Toaster position='top-center' reverseOrder={false} />
      <ul className='relative flex w-full list-none flex-col gap-1 md:w-[85%] lg:w-[70%] xl:w-[50%]'>
        <li className='grid w-full grid-cols-2 grid-rows-[1fr_1.5rem] place-items-center gap-1 rounded-t-lg border-[1px] border-solid border-[salmon] px-4 py-2'>
          <h1 className='col-span-2 text-center underline decoration-[salmon]'>
            {todo ? todo.title : <>Default title</>}
          </h1>
          <Filter />
          <AddButton
            className='self-center justify-self-end '
            onClick={startCreatingTask}
            disabled={isCreatingTask}
          >
            + Add Task
          </AddButton>
        </li>
        {(!tasks || !tasks.length) && !isCreatingTask && (
          <li className='flex w-full items-center justify-center border-[1px] px-4 py-2 text-gray-400'>
            No tasks, click + to create one.
          </li>
        )}
        {isCreatingTask && (
          <TaskForm close={terminateCreatingTask} save={createTask} />
        )}
        {todo &&
          tasks &&
          tasks.length > 0 &&
          tasks
            .filter((task) => filteringStatus.includes(task.status))
            .map((task) => (
              <Task
                key={task.id}
                task={task}
                todo={todo}
                broadcast={sendTaskToStreamer}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            ))}
        {!tasks.filter(({ status }) => status === 'IN_PROGRESS').length &&
          isEqual(filteringStatus, ['IN_PROGRESS']) &&
          !isCreatingTask && (
            <li className='flex w-full items-center justify-center border-[1px] border-solid border-[salmon] px-4 py-2 text-gray-400'>
              {"Congrats! You've finished all the tasks!"}
            </li>
          )}
        {tasks && tasks.length > 0 && (
          <li className='flex w-full items-center justify-between rounded-b-lg border-[1px] border-solid border-[salmon] px-4  py-2'>
            {`Count: ${tasks.filter(({ status }) => status === 'DONE').length} / ${tasks.length}`}
          </li>
        )}
      </ul>
    </main>
  );
};

export default TaskPage;
