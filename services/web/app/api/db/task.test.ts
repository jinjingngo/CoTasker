import {
  MockInstance,
  describe,
  beforeEach,
  afterEach,
  vi,
  it,
  expect,
} from 'vitest';
import { Pool } from 'pg';

import {
  queryTasksByTodoUUID,
  createTask,
  updateTask,
  deleteTask,
} from './task';
import * as db from '../client/db';
import { Status } from '@/shared/schemas';

describe('DB Task', () => {
  let spy: MockInstance<[], Pool> | null = null;
  beforeEach(() => {
    spy = vi.spyOn(db, 'getDBPool');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('queryTaskByTodoUUID', () => {
    it('should return `undefined` because getDBPool throws an error', async () => {
      spy!.mockImplementationOnce(() => {
        throw Error();
      });
      const tasks = await queryTasksByTodoUUID('fake-uuid');
      expect(tasks).toBeUndefined();
    });

    it('should return `undefined` because query throws an error', async () => {
      spy!.mockImplementationOnce(() => {
        return {
          query: () => {
            throw Error();
          },
        } as unknown as Pool;
      });
      const tasks = await queryTasksByTodoUUID('fake-uuid');
      expect(tasks).toBeUndefined();
    });

    it('should return expected array', async () => {
      spy!.mockImplementationOnce(() => {
        return {
          query: () => {
            return { rows: [] };
          },
        } as unknown as Pool;
      });

      const tasks = await queryTasksByTodoUUID('fake-uuid');
      expect(tasks).toStrictEqual([]);
    });
  });

  describe('createTask', () => {
    const seed = {
      uuid: 'fake-uuid',
      title: 'Grandson the First',
      status: 'IN_PROGRESS' as Status,
    };
    it('should return `undefined` because getDBPool throws an error', async () => {
      spy!.mockImplementationOnce(() => {
        throw Error();
      });
      const task = await createTask(seed);
      expect(task).toBeUndefined();
    });

    it('should return `undefined` because query throws an error', async () => {
      spy!.mockImplementationOnce(() => {
        return {
          query: () => {
            throw Error();
          },
        } as unknown as Pool;
      });
      const task = await createTask(seed);
      expect(task).toBeUndefined();
    });

    it('should return expected object', async () => {
      spy!.mockImplementationOnce(() => {
        return {
          query: () => {
            return { rows: [seed] };
          },
        } as unknown as Pool;
      });

      const task = await createTask(seed);
      expect(task).toStrictEqual(seed);
    });
  });

  describe('updateTask', () => {
    const seed = {
      id: 1,
      parent_id: 0,
      title: 'Grandson the First',
      status: 'IN_PROGRESS' as Status,
      notes: 'Some notes',
    };
    it('should return `undefined` because getDBPool throws an error', async () => {
      spy!.mockImplementationOnce(() => {
        throw Error();
      });
      const task = await updateTask(seed);
      expect(task).toBeUndefined();
    });

    it('should return `undefined` because query throws an error', async () => {
      spy!.mockImplementationOnce(() => {
        return {
          query: () => {
            throw Error();
          },
        } as unknown as Pool;
      });
      const task = await updateTask(seed);
      expect(task).toBeUndefined();
    });

    it('should return expected object', async () => {
      spy!.mockImplementationOnce(() => {
        return {
          query: () => {
            return { rows: [seed] };
          },
        } as unknown as Pool;
      });

      const task = await updateTask(seed);
      expect(task).toStrictEqual(seed);
    });
  });

  describe('deleteTask', () => {
    const taskId = 0;
    it('should return `undefined` because getDBPool throws an error', async () => {
      spy!.mockImplementationOnce(() => {
        throw Error();
      });
      const task = await deleteTask(taskId);
      expect(task).toBeUndefined();
    });

    it('should return `undefined` because query throws an error', async () => {
      spy!.mockImplementationOnce(() => {
        return {
          query: () => {
            throw Error();
          },
        } as unknown as Pool;
      });
      const task = await deleteTask(taskId);
      expect(task).toBeUndefined();
    });

    it('should return expected object', async () => {
      const expected = { rowCount: 1 };
      spy!.mockImplementation(() => {
        return {
          query: () => expected,
        } as unknown as Pool;
      });

      const tasks = await deleteTask(taskId);
      expect(tasks).toStrictEqual(expected);
    });
  });
});
