import useSWR from 'swr';
import { useEffect, useState } from 'react';

import { TASK_API_PATH, fetcher, mergeArrays, sortByIdDesc } from '../util';

import type { Task } from '@/shared/schemas';
import type { TasksQueryResult } from '../types';

export const useTask = (todo_uuid: string) => {
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
    // No need to `tasks` dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return { tasks, setTasks, error, isLoading };
};
