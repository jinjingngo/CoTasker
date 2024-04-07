import { useState, useCallback } from 'react';

import { sortByUpdatedDateDesc } from '../util';

import type { TaskTree, FilterStatus } from '../types';
import type { Task } from '@/shared/schemas';

const DEFAULT_STATUS: FilterStatus = 'IN_PROGRESS';

export const useTaskTree = () => {
  const [roots, setRoots] = useState<TaskTree[]>([]);
  const [filteringStatus, setFilteringStatus] =
    useState<FilterStatus>(DEFAULT_STATUS);

  /**
   * Hook for managing a tree of tasks,
   *  providing functionality to update and filter the tree based on task status.
   */
  const updateTaskTreeWithTasks = useCallback(
    (tasks: Task[]) => {
      const filteredTasks =
        filteringStatus === 'ALL'
          ? tasks
          : tasks.filter(({ status }) => status === filteringStatus);

      const taskMap = filteredTasks.reduce<Record<number, TaskTree>>(
        (acc, task) => {
          acc[task.id] = { ...task, children: [] };
          return acc;
        },
        {},
      );

      // Establish parent-child relationships within the filtered set
      // the magic object reference nature build the tree-view
      filteredTasks.forEach((task) => {
        const { id, parent_id } = task;
        if (
          parent_id !== undefined &&
          parent_id !== null &&
          taskMap[parent_id]
        ) {
          taskMap[parent_id].children.push(taskMap[id]);
        }
      });

      // built roots based on the no parent task and absence of a parent in the map
      const roots = Object.values(taskMap).filter(
        (task) => !task.parent_id || !taskMap[task.parent_id],
      );

      // Sort tasks and their children by updated date
      roots.forEach((task) => {
        task.children.sort(sortByUpdatedDateDesc);
        task.children.forEach((child) => {
          child.children.sort(sortByUpdatedDateDesc);
        });
      });

      setRoots(roots);
    },
    [filteringStatus],
  );

  /**
   * Updates the filter status used to display tasks.
   * @param {FilterStatus} status - The new filter status to apply.
   */
  const updateFilteringStatus = useCallback((status: FilterStatus) => {
    setFilteringStatus(status);
  }, []);

  return {
    roots,
    updateTaskTreeWithTasks,
    filteringStatus,
    updateFilteringStatus,
  };
};
