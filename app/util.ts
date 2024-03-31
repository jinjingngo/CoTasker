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
