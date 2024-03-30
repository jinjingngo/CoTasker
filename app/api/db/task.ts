import { Task } from '@/shared/schemas';
import { getDBPool } from '../client/db';
import { PostTask, UpdateTask } from '../types';
import { QueryResultBase } from 'pg';

export const queryTasksByTodoUUID = async (uuid: string) => {
  try {
    const sql = `SELECT
        *
      FROM
        public.task
      WHERE
        todo_id IN (
          SELECT
            id
          FROM
            public.todo
          WHERE
            uuid = $1
        )
      ORDER BY updated_date DESC`;

    const pool = getDBPool();

    const { rows } = await pool.query<Task>(sql, [uuid]);

    return rows;
  } catch (error) {
    console.error('[DB > task > queryTaskByTodoUUID] ', error);
  }
  return;
};

export const createTask = async (task: PostTask) => {
  try {
    const { title, status, uuid, parent_id, notes } = task;
    const fields = [
      `todo_id`,
      `title`,
      `status`,
      `created_date`,
      `updated_date`,
    ];
    const params: (string | number)[] = [title, status, 'now()', 'now()'];
    if (parent_id !== undefined && parent_id !== null) {
      fields.push(`parent_id`);
      params.push(parent_id);
    }
    if (notes) {
      fields.push(`notes`);
      params.push(notes);
    }

    const sql = `
      INSERT INTO
        public.task (${fields.join(', ')})
      VALUES
        (
          (SELECT id FROM public.todo WHERE uuid = $1),
          ${params.map((_, index) => `$${index + 2}`).join(', ')}
        )
      RETURNING *`;
    params.unshift(uuid);

    const pool = getDBPool();
    const {
      rows: [insertedTask],
    } = await pool.query<Task>(sql, params);

    return insertedTask;
  } catch (error) {
    console.error('[DB > task > createTask] ', error);
  }
  return;
};

export const updateTask = async (task: UpdateTask) => {
  try {
    const { id, title, status, parent_id, notes } = task;
    // TODO: `fields` and `params` can be mapped from a configure object
    //  leave it for now
    const fields = [`updated_date=now()`];
    const params: (string | number)[] = [id];
    if (title) {
      fields.push(`title=$${fields.length + 1}`);
      params.push(title);
    }
    if (status) {
      fields.push(`status=$${fields.length + 1}`);
      params.push(status);
    }
    if (parent_id !== undefined && parent_id !== null) {
      fields.push(`parent_id=$${fields.length + 1}`);
      params.push(parent_id);
    }
    if (notes) {
      fields.push(`notes=$${fields.length + 1}`);
      params.push(notes);
    }

    const sql = `
      UPDATE
        public.task
      SET
        ${fields.join(', ')}
      WHERE
        id = $1
      RETURNING *`;

    console.log({ sql, params });

    const pool = getDBPool();
    const {
      rows: [updatedTask],
    } = await pool.query<Task>(sql, params);

    return updatedTask;
  } catch (error) {
    console.error('[DB > task > updateTask] ', error);
  }
  return;
};

export const deleteTask = async (id: number) => {
  try {
    const sql = `DELETE FROM
        public.task
      WHERE id = $1`;

    const pool = getDBPool();
    const result = await pool.query<QueryResultBase>(sql, [id]);

    return result;
  } catch (error) {
    console.error('[DB > task > deleteTask] ', error);
  }
  return;
};
