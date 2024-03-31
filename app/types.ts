import type { Task, Todo } from '@/shared/schemas';

export type TodoQueryResult =
  | {
      todo: Todo[];
      total: number;
    }
  | undefined;

export type Params = { todo_uuid: string };

export type PathParam = { params: Params };

export type UpdatePathParam = { params: Partial<Pick<Task, 'id'>> & Params };

export type APIResponseType = {
  status?: string;
  error?: string;
};

export interface MutateTodoResponse extends Todo {
  error?: string;
}
