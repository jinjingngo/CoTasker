import { CLIENT_ERROR } from './common_error';
import type { Task } from './schemas';

export type Command = 'CREATED_TASK' | 'UPDATING_TASK' | 'DELETED_TASK';

export type StreamPayload = {
  cmd: Command;
  payload: {
    todo_uuid: string;
    task: Partial<Task>;
  };
};

export type ParseMessageDataResult = {
  error?: typeof CLIENT_ERROR;
  payload?: StreamPayload;
};
