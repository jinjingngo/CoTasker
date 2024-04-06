export const TEST_BASE_URL = 'http://localhost';

export const TODO_PAGINATION_LIMIT = 5;

export const TODO_API_PATH = '/api/todo';

export const TASK_API_PATH = '/api/task';

export const fetcher = (url: string, option?: Record<string, unknown>) =>
  fetch(url, option ?? {}).then((res) => res.json());

export const replaceItem = <T extends { [key: string]: any }>(
  items: T[],
  itemToReplace: T,
  matchProperty: keyof T,
): T[] => {
  return items.map((item) =>
    item[matchProperty] === itemToReplace[matchProperty] ? itemToReplace : item,
  );
};

export const mergeArrays = <T extends { id: number; updated_date: Date }>(
  a: T[],
  b: T[],
): T[] => {
  const mergedMap: Map<number, T> = new Map();

  const addTodo = (item: T) => {
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

export const sortByIdDesc = <T extends { id: number }>(a: T, z: T) =>
  z.id - a.id;

export const sortByUpdatedDateDesc = <
  T extends { updated_date: string | Date },
>(
  a: T,
  z: T,
) => new Date(z.updated_date).getTime() - new Date(a.updated_date).getTime();
