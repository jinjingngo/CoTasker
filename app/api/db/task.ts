import { Task } from "@/shared/schemas";
import { getDBPool } from "../client/db";

export const queryTaskByTodoUUID = async (uuid: string) => {
  try {
    const query = `SELECT
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

    const { rows } = await pool.query<Task>(query, [uuid]);

    return rows;
  } catch (error) {
    console.error("[DB > task > queryTaskByTodoUUID] ", error);
  }
  return;
};
