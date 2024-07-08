import { Task } from '../../shared/schemas';
import { Env } from './types';
import { MutateTaskResponse } from '../../app/types';

export const updateTask = async (
  task: Partial<Task>,
  todo_uuid: string,
  env: Env,
) => {
  try {
    const url = `${env.API_URL}/api/task/${todo_uuid}/${task.id}`;
    const response = await fetch(url, {
      method: 'PATCH',
      body: JSON.stringify(task),
    });

    const updatedTask = (await response.json()) as MutateTaskResponse;
    return updatedTask;
  } catch (error) {
    console.log(error);
    return { error };
  }
};
