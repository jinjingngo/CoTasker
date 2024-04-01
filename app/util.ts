import { Todo } from '@/shared/schemas';

export const TEST_BASE_URL = 'http://localhost';

export const TODO_PAGINATION_LIMIT = 5;

export const fetcher = (url: string, option?: Record<string, unknown>) =>
  fetch(url, option ?? {}).then((res) => res.json());

export const TODO_API_PATH = '/api/todo';

export const TASK_API_PATH = '/api/task';

export const replaceItem = <T extends { [key: string]: any }>(
  items: T[],
  itemToReplace: T,
  matchProperty: keyof T,
): T[] => {
  return items.map((item) =>
    item[matchProperty] === itemToReplace[matchProperty] ? itemToReplace : item,
  );
};

export const mergeTodoArrays = (a: Todo[], b: Todo[]): Todo[] => {
  const mergedMap: Map<number, Todo> = new Map();

  const addTodo = (item: Todo) => {
    const existingItem = mergedMap.get(item.id);
    if (
      !existingItem ||
      new Date(item.updated_date) > new Date(existingItem.updated_date)
    ) {
      mergedMap.set(item.id, item);
    }
  };

  a.forEach(addTodo);
  b.forEach(addTodo);

  return Array.from(mergedMap.values());
};
