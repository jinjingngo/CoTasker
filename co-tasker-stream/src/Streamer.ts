import type {
  Command,
  CreatedTaskStreamPayload,
  DeletedTaskStreamPayload,
  OperationFunction,
  UpdatingTaskStreamPayload,
} from '../../shared/types';

/**
 * Sending the updates to the REST API then broadcasting the updated task
 * 	if got any error abandon the broadcast
 * @param {UpdatingTaskStreamPayload} payload
 * @param {WebSocket[]} clients
 */
const updatingTaskOperation = (
  payload: UpdatingTaskStreamPayload,
  clients: WebSocket[],
) => {
  // TODO: send the updates to the REST API
  console.log('[Broadcast > updatingTaskOperation] message: ', payload);
  clients.forEach((client) => {
    client.send(JSON.stringify(payload));
  });
};

/**
 * Broadcast the created task
 * @param {CreatedTaskStreamPayload} payload
 * @param {WebSocket[]} clients
 */
const createdTaskOperation = (
  payload: CreatedTaskStreamPayload,
  clients: WebSocket[],
) => {
  console.log('[Broadcast > createdTaskOperation] message: ', payload);
  clients.forEach((client) => {
    client.send(JSON.stringify(payload));
  });
};

/**
 * Broadcast the deleted task
 * @param {DeletedTaskStreamPayload} payload
 * @param {WebSocket[]} clients
 */
const deletedTaskOperation = (
  payload: DeletedTaskStreamPayload,
  clients: WebSocket[],
) => {
  console.log('[Broadcast > deletedTaskOperation] message: ', payload, clients);
  clients.forEach((client) => {
    client.send(JSON.stringify(payload));
  });
};

const operations: Record<Command, OperationFunction> = {
  CREATED_TASK: createdTaskOperation,
  UPDATING_TASK: updatingTaskOperation,
  DELETED_TASK: deletedTaskOperation,
};

export class Streamer {
  private clients = new Set<WebSocket>();

  constructor(state: DurableObjectState, env: Env) {
    // TODO: maybe we can have sockets hibernation here
    console.log({ state, env });
  }

  async fetch(request: Request) {
    const url = new URL(request.url);
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Not a WebSocket request', { status: 400 });
    }

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
  broadcast(message: MessageEvent, server: WebSocket) {
    try {
      const { data } = message;
      console.log('[Broadcast] receiving message: ', data);

      // only proceed JSON string message
      if (typeof data !== 'string') return;

      const parsedData = JSON.parse(data);

      const { cmd, payload } = parsedData;
      const operation = operations[cmd as Command];
      // invalid command
      if (!operation) return;
      const clients = [...this.clients].filter(
        (client) => client !== server && client.readyState === WebSocket.OPEN,
      );
      operation(payload, clients);
    } catch (error) {
      console.error(error);
    }
  }
}
