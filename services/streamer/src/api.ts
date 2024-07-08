import type { Task } from "../../web/shared/schemas";
import type { Env } from "./types";
import type { MutateTaskResponse } from "../../web/app/types";

export const updateTask = async (
  task: Partial<Task>,
  todo_uuid: string,
  env: Env
) => {
  try {
    const url = `${env.API_URL}/api/task/${todo_uuid}/${task.id}`;
    const response = await fetch(url, {
      method: "PATCH",
      body: JSON.stringify(task),
    });

    const updatedTask = (await response.json()) as MutateTaskResponse;
    return updatedTask;
  } catch (error) {
    console.log(error);
    return { error };
  }
};
