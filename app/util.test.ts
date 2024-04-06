import { describe, it, expect } from 'vitest';

import {
  replaceItem,
  mergeArrays,
  sortByIdDesc,
  sortByUpdatedDateDesc,
} from './util';

import type { Task, Todo } from '@/shared/schemas';
import { TaskTree } from './types';

describe('util', () => {
  describe('replaceItem', () => {
    it('replaces an existing item based on the matchProperty', () => {
      const items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ];
      const newItem = { id: 2, name: 'Updated Item 2' };
      const updatedItems = replaceItem(items, newItem, 'id');

      const expectedItems = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Updated Item 2' },
        { id: 3, name: 'Item 3' },
      ];

      expect(updatedItems).toEqual(expectedItems);
    });

    it('returns the same array when no item matches the matchProperty', () => {
      const items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ];
      const newItem = { id: 3, name: 'New Item 3' };
      const updatedItems = replaceItem(items, newItem, 'id');

      expect(updatedItems).toEqual(items);
    });

    it('handles empty arrays gracefully', () => {
      const items: any[] = [];
      const newItem = { id: 1, name: 'New Item 1' };
      const updatedItems = replaceItem(items, newItem, 'id');

      expect(updatedItems).toEqual([]);
    });
  });

  describe('mergeArrays', () => {
    it('merges two arrays by id and takes the latest updated_date', () => {
      const a = [
        { id: 1, updated_date: '2024-04-01T06:20:05.759Z' },
        { id: 2, updated_date: '2024-04-01T06:20:00.759Z' },
        { id: 3, updated_date: '2024-04-01T06:20:05.759Z' },
      ] as unknown as Todo[];

      const b = [
        { id: 1, updated_date: '2024-04-01T06:20:03.759Z' },
        { id: 2, updated_date: '2024-04-01T06:20:05.759Z' },
        { id: 3, updated_date: '2024-04-01T06:20:05.759Z' },
      ] as unknown as Todo[];

      const expected = [
        { id: 1, updated_date: '2024-04-01T06:20:05.759Z' },
        { id: 2, updated_date: '2024-04-01T06:20:05.759Z' },
        { id: 3, updated_date: '2024-04-01T06:20:05.759Z' },
      ];

      const result = mergeArrays(a, b);
      expect(result).toEqual(expected);
    });
  });
  describe('sortByIdDesc', () => {
    it('correctly sorts an array of objects by id in descending order', () => {
      const input = [
        { id: 1, name: 'Task 1' },
        { id: 3, name: 'Task 3' },
        { id: 2, name: 'Task 2' },
      ];
      const expected = [
        { id: 3, name: 'Task 3' },
        { id: 2, name: 'Task 2' },
        { id: 1, name: 'Task 1' },
      ];
      expect(input.sort(sortByIdDesc)).toEqual(expected);
    });

    it('does nothing when given an empty array', () => {
      const input: any[] = [];
      expect(input.sort(sortByIdDesc)).toEqual([]);
    });

    it('behaves correctly with a single-element array', () => {
      const input = [{ id: 1, name: 'Only Task' }];
      expect(input.sort(sortByIdDesc)).toEqual([{ id: 1, name: 'Only Task' }]);
    });

    it('maintains order when array is already sorted in descending order', () => {
      const input = [
        { id: 3, name: 'Task 3' },
        { id: 2, name: 'Task 2' },
        { id: 1, name: 'Task 1' },
      ];
      expect(input.sort(sortByIdDesc)).toEqual(input);
    });

    it('handles objects with equal id values consistently', () => {
      const input = [
        { id: 2, name: 'Task 2 - A' },
        { id: 1, name: 'Task 1' },
        { id: 2, name: 'Task 2 - B' },
      ];
      const expectedFirst = { id: 2, name: 'Task 2 - A' };
      const result = input.sort(sortByIdDesc);
      expect(result[0]).toEqual(expectedFirst);
      expect(result[result.length - 1]).toEqual({ id: 1, name: 'Task 1' });
    });
  });

  describe('sortByUpdatedDateDesc', () => {
    it('correctly sorts an array of objects by id in descending order', () => {
      const input = [
        {
          id: 1,
          name: 'Task 1',
          updated_date: new Date('2024-04-06T09:09:47.381Z'),
        },
        {
          id: 2,
          name: 'Task 2',
          updated_date: new Date('2024-04-06T09:09:48.381Z'),
        },
        {
          id: 3,
          name: 'Task 3',
          updated_date: new Date('2024-04-06T09:09:49.381Z'),
        },
      ];
      const expected = [
        {
          id: 3,
          name: 'Task 3',
          updated_date: new Date('2024-04-06T09:09:49.381Z'),
        },
        {
          id: 2,
          name: 'Task 2',
          updated_date: new Date('2024-04-06T09:09:48.381Z'),
        },
        {
          id: 1,
          name: 'Task 1',
          updated_date: new Date('2024-04-06T09:09:47.381Z'),
        },
      ];
      expect(input.sort(sortByUpdatedDateDesc)).toEqual(expected);
    });

    it('does nothing when given an empty array', () => {
      const input: any[] = [];
      expect(input.sort(sortByUpdatedDateDesc)).toEqual([]);
    });

    it('behaves correctly with a single-element array', () => {
      const input = [
        {
          id: 1,
          name: 'Only Task',
          updated_date: new Date('2024-04-06T09:09:47.381Z'),
        },
      ];
      expect(input.sort(sortByUpdatedDateDesc)).toEqual(input);
    });

    it('maintains order when array is already sorted in descending order', () => {
      const input = [
        {
          id: 3,
          name: 'Task 3',
          updated_date: new Date('2024-04-06T09:09:49.381Z'),
        },
        {
          id: 2,
          name: 'Task 2',
          updated_date: new Date('2024-04-06T09:09:48.381Z'),
        },
        {
          id: 1,
          name: 'Task 1',
          updated_date: new Date('2024-04-06T09:09:47.381Z'),
        },
      ];
      expect(input.sort(sortByUpdatedDateDesc)).toEqual(input);
    });

    it('handles objects with equal id values consistently', () => {
      const input = [
        {
          id: 2,
          name: 'Task 2 - A',
          updated_date: new Date('2024-04-06T09:09:48.381Z'),
        },
        {
          id: 1,
          name: 'Task 1',
          updated_date: new Date('2024-04-06T09:09:47.381Z'),
        },
        {
          id: 2,
          name: 'Task 2 - B',
          updated_date: new Date('2024-04-06T09:09:48.381Z'),
        },
      ];
      const expectedFirst = input[0];
      const result = input.sort(sortByUpdatedDateDesc);
      expect(result[0]).toEqual(expectedFirst);
      expect(result[result.length - 1]).toEqual(input[2]);
    });
  });
});
