import { Task } from './schemas';

export type Command = 'CREATED_TASK' | 'UPDATING_TASK' | 'DELETED_TASK';

export type StreamPayload = {
  cmd: Command;
  payload: any;
};

export type CreatedTaskStreamPayload = StreamPayload & {
  payload: Task;
};

export type UpdatingTaskStreamPayload = StreamPayload & {
  payload: Partial<Task>;
};

export type DeletedTaskStreamPayload = StreamPayload & {
  payload: Pick<Task, 'id'>;
};

export type OperationFunction = (payload: any, clients: WebSocket[]) => void;
