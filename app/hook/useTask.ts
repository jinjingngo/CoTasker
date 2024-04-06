import useSWR from 'swr';
import { useEffect, useState } from 'react';

import { TASK_API_PATH, fetcher, mergeArrays, sortByIdDesc } from '../util';
import { useTaskTree } from '.';

import type { Task } from '@/shared/schemas';
import type { TaskTree, TasksQueryResult } from '../types';

export const useTask = (todo_uuid: string) => {
  const {
    roots,
    getTaskTree,
    addTask: addTaskToTaskTree,
    updateTask: updateTaskInTaskTree,
    deleteTask: deleteTaskFromTaskTree,
    patchTasks,
  } = useTaskTree();

  const { data, error, isLoading } = useSWR<TasksQueryResult>(
    `${TASK_API_PATH}/${todo_uuid}`,
    fetcher,
  );

  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!data) return;
    setTasks((currentTasks) => {
      const unshiftedTasks = mergeArrays(currentTasks, data).sort(sortByIdDesc);
      return unshiftedTasks;
    });
    getTaskTree(data);
    // No need to `tasks` dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return {
    tasks,
    setTasks,
    roots,
    addTaskToTaskTree,
    updateTaskInTaskTree,
    deleteTaskFromTaskTree,
    error,
    isLoading,
  };
};
