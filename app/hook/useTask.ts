import useSWR from 'swr';
import { useEffect, useState } from 'react';

import { TASK_API_PATH, fetcher, mergeArrays, sortByIdDesc } from '../util';

import type { Task } from '@/shared/schemas';
import type { TaskTree, TasksQueryResult } from '../types';
import { getTaskTree, patchTasks } from '../utils/TaskTreeManager';

export const useTask = (todo_uuid: string) => {
  const { data, error, isLoading } = useSWR<TasksQueryResult>(
    `${TASK_API_PATH}/${todo_uuid}`,
    fetcher,
  );

  const [tasks, setTasks] = useState<Task[]>([]);

  const [taskTree, setTaskTree] = useState<TaskTree[]>(getTaskTree([]));

  useEffect(() => {
    if (!data) return;
    setTasks((currentTasks) => {
      const unshiftedTasks = mergeArrays(currentTasks, data).sort(sortByIdDesc);
      return unshiftedTasks;
    });
    setTaskTree(() => {
      patchTasks(data);
      const tree = getTaskTree();
      console.log({ tree });
      return tree;
    });
    // No need to `tasks` dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return { tasks, setTasks, error, isLoading };
};
