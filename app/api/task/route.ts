import { queryTasksByTodoUUID } from '../db/task';

export async function GET(request: Request) {
  return new Response('Tasks!', {
    status: 200,
  });
}
