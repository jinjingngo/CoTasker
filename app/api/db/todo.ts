import { v4 as uuid } from "uuid";
import { Todo } from "@/shared/schemas";
import { getDBPool } from "../client/db";
import { QueryResultBase } from "pg";

type TodoQueryResult =
  | {
      todo: Todo[];
      total: number;
    }
  | undefined;

type TodoCreateResult = Todo | undefined;

type TodoUpdateResult = TodoCreateResult;

export const queryTodos = async (
  offset: number,
  limit: number
): Promise<TodoQueryResult> => {
  try {
    const sql = `SELECT
      *
    FROM
      public.todo
    ORDER BY updated_date DESC
    OFFSET $1
    LIMIT $2`;

    const countSql = `SELECT
      CAST(COUNT(id) AS INTEGER) AS total
    FROM
      public.todo`;

    const pool = getDBPool();

    const [
      { rows },
      {
        rows: [{ total }],
      },
    ] = await Promise.all([
      pool.query<Todo>(sql, [offset, limit]),
      pool.query<{ total: number }>(countSql),
    ]);

    return { todo: rows, total };
  } catch (error) {
    console.error("[DB > todo > queryTodos] ", error);
  }
  return;
};

export const createTodo = async (title: string): Promise<TodoCreateResult> => {
  try {
    const sql = `INSERT INTO
      public.todo (uuid, title)
    VALUES
      ($1, $2)
    RETURNING *`;

    const pool = getDBPool();
    const {
      rows: [todo],
    } = await pool.query<Todo>(sql, [uuid(), title]);

    return todo;
  } catch (error) {
    console.error("[DB > todo > createTodo] ", error);
  }
  return;
};

export const updateTodo = async (
  uuid: string,
  title: string
): Promise<TodoUpdateResult> => {
  try {
    const sql = `UPDATE
      public.todo
    SET
      title=$2, updated_date=now()
    WHERE
      uuid = $1
    RETURNING *`;

    const pool = getDBPool();
    const {
      rows: [todo],
    } = await pool.query<Todo>(sql, [uuid, title]);

    return todo;
  } catch (error) {
    console.error("[DB > todo > updateTodo] ", error);
  }
  return;
};

export const deleteTodo = async (uuid: string) => {
  try {
    const sql = `DELETE FROM
      public.todo
    WHERE uuid = $1`;

    const pool = getDBPool();
    const result = await pool.query<QueryResultBase>(sql, [uuid]);

    return result;
  } catch (error) {
    console.error("[DB > todo > deleteTodo] ", error);
  }
  return;
};
