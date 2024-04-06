import { useState, useCallback } from 'react';

import { sortByUpdatedDateDesc } from '../util';

import type { TaskTree } from '../types';
import type { Task } from '@/shared/schemas';

// TODO:
//  1. filter feature rebuild
//  2. sort the children
//  3. refactoring
export const useTaskTree = () => {
  const [roots, setRoots] = useState<TaskTree[]>([]);

  const updateOrAddNode = useCallback(
    (taskMap: Record<number, TaskTree>, task: Task) => {
      if (!taskMap[task.id]) {
        taskMap[task.id] = { ...task, children: [] };
      } else {
        Object.assign(taskMap[task.id], task);
      }

      const node = taskMap[task.id];
      if (task.parent_id && taskMap[task.parent_id]) {
        const parent = taskMap[task.parent_id];
        const index = parent.children.findIndex((t) => t.id === node.id);
        if (index === -1) {
          parent.children.push(node);
        } else {
          parent.children[index] = node;
        }
      } else {
        setRoots((prevRoots) => [
          ...prevRoots.filter((r) => r.id !== node.id),
          node,
        ]);
      }
    },
    [],
  );

  const getTaskTree = useCallback(
    (tasks?: Task[]): TaskTree[] => {
      if (!tasks) return roots;

      const taskMap: Record<number, TaskTree> = {};
      // Sort tasks to ensure parents are processed before children
      const sortedTasks = tasks.sort((a, b) => (a.parent_id === null ? -1 : 1));
      sortedTasks.forEach((task) => updateOrAddNode(taskMap, task));

      const newRoots = Object.values(taskMap).filter(
        (task) => !task.parent_id || !taskMap[task.parent_id],
      );
      newRoots.sort(sortByUpdatedDateDesc);
      setRoots(newRoots);
      return newRoots;
    },
    [roots, updateOrAddNode],
  );

  const getExcludedTasks = useCallback(
    (excludedId?: number): Task[] => {
      const excludedTasks: Task[] = [];
      const recurseTasks = (tasks: TaskTree[]) => {
        tasks.forEach((task) => {
          if (task.id !== excludedId) {
            excludedTasks.push({ ...task });
            recurseTasks(task.children);
          }
        });
      };
      recurseTasks(roots);
      return excludedTasks;
    },
    [roots],
  );

  const addTask = useCallback(
    (task: Task) => {
      getTaskTree([...getExcludedTasks(task.id), task]);
    },
    [getExcludedTasks, getTaskTree],
  );

  const deleteTask = useCallback(
    (task: Task) => {
      const excludedTasks = getExcludedTasks(task.id);
      getTaskTree(excludedTasks);
    },
    [getExcludedTasks, getTaskTree],
  );

  const patchTasks = useCallback(
    (tasks: Task[]) => {
      getTaskTree([...getExcludedTasks(), ...tasks]);
    },
    [getExcludedTasks, getTaskTree],
  );

  return {
    roots,
    addTask,
    getTaskTree,
    updateTask: addTask,
    deleteTask,
    patchTasks,
  };
};
