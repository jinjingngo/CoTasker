import { CLIENT_ERROR } from '../../shared/common_error';
import { updateTask } from './api';

import type { Env, StreamPayload } from './types';

type ParseMessageDataResult = {
  error?: typeof CLIENT_ERROR;
  payload?: any;
};

export class Streamer {
  private clients = new Set<WebSocket>();
  private env: Env;
  private todo_uuid: string = '';

  constructor(state: DurableObjectState, env: Env) {
    this.env = env;
  }

  async fetch(request: Request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Not a WebSocket request', { status: 400 });
    }

    const { pathname } = new URL(request.url);
    const [, , todo_uuid] = pathname.split('/');
    this.todo_uuid = todo_uuid;

    const { 0: client, 1: server } = new WebSocketPair();
    this.clients.add(server);

    server.accept();
    server.addEventListener('message', (message) =>
      this.broadcast(message, server),
    );
    server.addEventListener('close', () => this.clients.delete(server));

    return new Response(null, { status: 101, webSocket: client });
  }

  /**
   * Here we do:
   * 1. send the updating to the REST API then broadcasting the updated task
   * 	if got any error, abandon the broadcast
   * 2. broadcasting deleting task
   * 3. broadcasting adding task
   *
   * @param message
   * @param server
   */
  async broadcast(message: MessageEvent, server: WebSocket) {
    try {
      const { data } = message;
      console.log('[Broadcast] receiving message: ', data);

      // only proceed JSON string message
      if (typeof data !== 'string') return;

      const request = JSON.parse(data) as StreamPayload;

      const clients = [...this.clients].filter(
        (client) => client !== server && client.readyState === WebSocket.OPEN,
      );

      const { error, payload } = await this.parseMessageData(request);

      if (error) {
        console.log('[Broadcast] no broadcasting cause an error: ', error);
        server.send(JSON.stringify(error));
        return;
      }

      console.log('[Broadcast] broadcasting message: ', payload);
      clients.forEach((client) => {
        client.send(JSON.stringify(payload));
      });
    } catch (error) {
      console.error('[Broadcast] catch an error: ', error);
    }
  }

  async parseMessageData(data: StreamPayload): Promise<ParseMessageDataResult> {
    const { cmd, payload } = data;

    if (!['UPDATING_TASK', 'CREATED_TASK', 'DELETED_TASK'].includes(cmd)) {
      return { error: CLIENT_ERROR };
    }

    if (cmd === 'CREATED_TASK' || cmd === 'DELETED_TASK') {
      return { payload };
    }

    // TODO: send the updates to the REST API
    const { id, parent_id, title, notes, status } = payload;
    if (id === undefined || id === null) {
      return { error: CLIENT_ERROR };
    }

    if (
      (parent_id === undefined || parent_id === null) &&
      !title &&
      !notes &&
      !status
    ) {
      return { error: CLIENT_ERROR };
    }

    const updatedTask = await updateTask(payload, this.todo_uuid, this.env);
    const { error } = updatedTask;
    if (error) return { error: CLIENT_ERROR };
    return { payload: updatedTask };
  }
}
