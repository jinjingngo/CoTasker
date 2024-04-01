import { describe, it, expect } from 'vitest';
import { replaceItem, mergeTodoArrays } from './util'; // Update this import path
import type { Todo } from '@/shared/schemas';

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

describe('mergeTodoArrays', () => {
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

    const result = mergeTodoArrays(a, b);
    expect(result).toEqual(expected);
  });
});
