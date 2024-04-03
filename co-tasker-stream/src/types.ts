import type { Task } from '../../shared/schemas';

export interface Env {
  Streamer: DurableObjectNamespace;
  API_URL: string;
}

export type API_ERROR = {
  error: string;
};

export type OperationFunction = (
  payload: any,
  clients: WebSocket[],
) => void | Promise<API_ERROR | void>;
