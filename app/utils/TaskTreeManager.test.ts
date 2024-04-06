import { describe, it, expect, beforeEach } from 'vitest';

import {
  getTaskTree,
  addTask,
  deleteTask,
  patchTasks,
  updateTask,
} from './TaskTreeManager';

import type { Task } from '@/shared/schemas';
const sampleTasks: Task[] = [
  {
    id: 1,
    todo_id: 1,
    parent_id: null,
    title: 'Root Task',
    created_date: new Date('2021-01-01T09:09:48.381Z'),
    updated_date: new Date('2021-01-02T09:09:48.381Z'),
    status: 'IN_PROGRESS',
  },
  {
    id: 2,
    todo_id: 2,
    parent_id: 1,
    title: 'Child Task 1',
    created_date: new Date('2021-01-01T09:09:48.381Z'),
    updated_date: new Date('2021-01-03T09:09:48.381Z'),
    status: 'IN_PROGRESS',
  },
  {
    id: 3,
    todo_id: 3,
    parent_id: 1,
    title: 'Child Task 2',
    created_date: new Date('2021-01-01T09:09:48.381Z'),
    updated_date: new Date('2021-01-04T09:09:48.381Z'),
    status: 'IN_PROGRESS',
  },
];

describe('TaskTreeManager', () => {
  beforeEach(() => {
    // Reset the tree before each test to start with a clean state
    getTaskTree([]);
  });

  it('should initialize an empty task tree', () => {
    expect(getTaskTree()).toEqual([]);
  });

  it('should add a task to an empty tree', () => {
    addTask(sampleTasks[0]);
    expect(getTaskTree()).toEqual([{ ...sampleTasks[0], children: [] }]);
  });

  it('should handle adding multiple tasks and maintain hierarchy', () => {
    addTask(sampleTasks[0]);
    addTask(sampleTasks[1]);
    addTask(sampleTasks[2]);
    const tree = getTaskTree();
    expect(tree.length).toBe(1);
    expect(tree[0].children.length).toBe(2);
  });

  it('should update an existing task in the tree', () => {
    addTask(sampleTasks[0]);
    addTask(sampleTasks[1]);
    const updatedTask = {
      ...sampleTasks[1],
      title: 'Updated Child Task 1',
      updated_date: new Date('2021-03-01T09:09:48.381Z'),
    };
    updateTask(updatedTask);
    const tree = getTaskTree();
    expect(tree[0].children.length).toBe(1);
    expect(tree[0].children[0].title).toBe('Updated Child Task 1');
  });

  it('should delete a task from the tree', () => {
    addTask(sampleTasks[0]);
    addTask(sampleTasks[1]);
    deleteTask(sampleTasks[1]);
    const tree = getTaskTree();
    expect(tree[0].children).toEqual([]);
  });

  it('should correctly patch tasks into the tree, adding new and updating existing', () => {
    addTask(sampleTasks[0]);
    patchTasks([
      {
        ...sampleTasks[1],
        title: 'Modified Child Task 1',
        updated_date: new Date('2021-03-01T09:09:48.381Z'),
      }, // Update existing
      {
        id: 4,
        todo_id: 4,
        parent_id: 1,
        title: 'New Child Task',
        created_date: new Date('2021-03-01T09:09:48.381Z'),
        updated_date: new Date('2021-03-02T09:09:48.381Z'),
        status: 'IN_PROGRESS',
      }, // New task
    ]);
    const trees = getTaskTree();
    expect(trees[0].children.length).toBe(2);
    const titles = trees[0].children.map((c) => c.title);
    expect(titles).toContain('Modified Child Task 1');
    expect(titles).toContain('New Child Task');
  });
});
