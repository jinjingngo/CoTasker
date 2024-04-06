import type { TaskTree } from '../types';

import type { Task } from '@/shared/schemas';
import { sortByUpdatedDateDesc } from '../util';

let roots: TaskTree[] = [];

const removeNodeFromParent = (children: TaskTree[], node: TaskTree) => {
  const index = children.findIndex((n) => n.id === node.id);
  if (index > -1) children.splice(index, 1);
};

const updateOrAddNode = (taskMap: Record<number, TaskTree>, task: Task) => {
  if (!taskMap[task.id]) {
    taskMap[task.id] = { ...task, children: [] };
  } else {
    Object.assign(taskMap[task.id], task);
  }

  const node = taskMap[task.id];
  // Always remove node from roots in case it's being repositioned in the tree
  removeNodeFromParent(roots, node);
  if (
    task.parent_id === undefined ||
    task.parent_id === null ||
    !taskMap[task.parent_id]
  ) {
    roots.push(node);
  } else {
    const parent = taskMap[task.parent_id];
    const index = parent.children.findIndex((t) => t.id === node.id);
    if (index === -1) {
      parent.children.push(node);
    } else {
      parent.children[index] = node;
    }
  }
};

export const getTaskTree = (tasks?: Task[]): TaskTree[] => {
  if (!tasks) return roots;

  const taskMap: Record<number, TaskTree> = {};
  tasks.forEach((task) => updateOrAddNode(taskMap, task));

  roots = Object.values(taskMap).filter(
    (task) => task.parent_id == null || !taskMap[task.parent_id],
  );
  roots.sort(sortByUpdatedDateDesc);
  Object.values(taskMap).forEach((task) =>
    task.children.sort(sortByUpdatedDateDesc),
  );

  return roots;
};

const getExcludedTasks = (excludedId?: number): Task[] => {
  let allTasks: Task[] = [];
  const recurseTasks = (tasks: TaskTree[]) => {
    tasks.forEach((task) => {
      if (!excludedId || task.id !== excludedId) {
        allTasks.push(task);
        recurseTasks(task.children);
      }
    });
  };
  recurseTasks(roots);
  return allTasks;
};

export const addTask = (task: Task): void => {
  getTaskTree([...getExcludedTasks(task.id), task]);
};

export const updateTask = addTask;

export const deleteTask = (task: Task): void => {
  const filteredTasks = getExcludedTasks(task.id);
  getTaskTree(filteredTasks);
};

export const patchTasks = (tasks: Task[]): void => {
  getTaskTree([...getExcludedTasks(), ...tasks]);
};
