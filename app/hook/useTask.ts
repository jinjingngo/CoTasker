import useSWR from 'swr';
import { useEffect, useState } from 'react';

import { TASK_API_PATH, fetcher, mergeArrays, sortByIdDesc } from '../util';
import { useTaskTree } from '.';

import type { Task } from '@/shared/schemas';
import type { TasksQueryResult } from '../types';

type Statistics = {
  total: number;
  done: number;
};

export const useTask = (todo_uuid: string) => {
  const {
    roots,
    updateTaskTreeWithTasks,
    filteringStatus,
    updateFilteringStatus,
  } = useTaskTree();

  const { data, error, isLoading } = useSWR<TasksQueryResult>(
    `${TASK_API_PATH}/${todo_uuid}`,
    fetcher,
  );

  const [tasks, setTasks] = useState<Task[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    done: 0,
  });

  useEffect(() => {
    if (!data) return;
    setTasks((currentTasks) => {
      const unshiftedTasks = mergeArrays(currentTasks, data).sort(sortByIdDesc);
      return unshiftedTasks;
    });
  }, [data]);

  useEffect(() => {
    if (!tasks.length) return;
    updateTaskTreeWithTasks(tasks);
    setStatistics({
      total: tasks.length,
      done: tasks.filter(({ status }) => status === 'DONE').length,
    });
  }, [tasks, updateTaskTreeWithTasks]);

  return {
    tasks,
    setTasks,
    statistics,
    roots,
    filteringStatus,
    updateFilteringStatus,
    error,
    isLoading,
  };
};
