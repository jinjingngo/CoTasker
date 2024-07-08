import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTaskTree } from './useTaskTree';
import { Status } from '@/shared/schemas';

describe('useTaskTree', () => {
  it('initializes with the default filtering status and empty roots', () => {
    const { result } = renderHook(() => useTaskTree());
    expect(result.current.filteringStatus).toBe('IN_PROGRESS');
    expect(result.current.roots).toEqual([]);
  });

  it('updates roots correctly when tasks are updated', async () => {
    const { result } = renderHook(() => useTaskTree());
    const tasks = [
      {
        id: 1,
        parent_id: null,
        todo_id: 1,
        title: 'Root Task',
        status: 'IN_PROGRESS' as Status,
        children: [],
        created_date: new Date(),
        updated_date: new Date(),
      },
      {
        id: 2,
        parent_id: 1,
        todo_id: 1,
        title: 'Child Task',
        status: 'IN_PROGRESS' as Status,
        children: [],
        created_date: new Date(),
        updated_date: new Date(),
      },
    ];

    await waitFor(() => {
      result.current.updateTaskTreeWithTasks(tasks);
      expect(result.current.roots.length).toBe(1);
      expect(result.current.roots[0].id).toBe(1);
      expect(result.current.roots[0].children.length).toBe(1);
      expect(result.current.roots[0].children[0].id).toBe(2);
    });
  });
  it('filters tasks based on status correctly', async () => {
    const { result } = renderHook(() => useTaskTree());

    await waitFor(() => {
      result.current.updateFilteringStatus('DONE');
    });

    const tasks = [
      {
        id: 1,
        parent_id: null,
        todo_id: 1,
        title: 'Root Task',
        status: 'IN_PROGRESS' as Status,
        children: [],
        created_date: new Date(),
        updated_date: new Date(),
      },
      {
        id: 2,
        parent_id: 1,
        todo_id: 1,
        title: 'Child Task',
        status: 'DONE' as Status,
        children: [],
        created_date: new Date(),
        updated_date: new Date(),
      },
    ];

    await waitFor(() => {
      result.current.updateTaskTreeWithTasks(tasks);

      // Expecting no roots because the root task is not 'DONE'
      expect(result.current.roots.length).toBe(0);
    });
  });

  it('changes filtering status correctly', async () => {
    const { result } = renderHook(() => useTaskTree());

    await waitFor(() => {
      result.current.updateFilteringStatus('DONE');
    });

    expect(result.current.filteringStatus).toBe('DONE');
  });
});
