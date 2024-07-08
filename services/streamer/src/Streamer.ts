import { CLIENT_ERROR } from "../../web/shared/common_error";
import { Task } from "../../web/shared/schemas";
import { updateTask } from "./api";
import type {
  ParseMessageDataResult,
  StreamPayload,
} from "../../web/shared/types";
import type { Env } from "./types";

export class Streamer {
  private clients = new Set<WebSocket>();
  private env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.env = env;
  }

  async fetch(request: Request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Not a WebSocket request", { status: 400 });
    }

    const { 0: client, 1: server } = new WebSocketPair();
    this.clients.add(server);

    server.accept();
    server.addEventListener("message", (message) =>
      this.broadcast(message, server)
    );
    server.addEventListener("close", () => this.clients.delete(server));

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
      console.log("[Broadcast] receiving message: ", data);

      // only proceed JSON string message
      if (typeof data !== "string") return;

      const request = JSON.parse(data) as StreamPayload;

      const { error, payload } = await this.parseMessageData(request);

      if (error) {
        console.log("[Broadcast] no broadcasting cause an error: ", error);
        server.send(JSON.stringify(error));
        return;
      }

      console.log("[Broadcast] broadcasting message: ", payload);

      const clients = [...this.clients].filter(
        (client) => client !== server && client.readyState === WebSocket.OPEN
      );

      clients.forEach((client) => {
        client.send(JSON.stringify(payload));
      });
    } catch (error) {
      console.error("[Broadcast] catch an error: ", error);
    }
  }

  async parseMessageData(data: StreamPayload): Promise<ParseMessageDataResult> {
    const {
      cmd,
      payload: { todo_uuid, task },
    } = data;

    if (!["UPDATING_TASK", "CREATED_TASK", "DELETED_TASK"].includes(cmd)) {
      return { error: CLIENT_ERROR };
    }

    if (cmd === "CREATED_TASK" || cmd === "DELETED_TASK") {
      return { payload: data };
    }

    // TODO: send the updates to the REST API
    const { id, todo_id, parent_id, title, notes, status } = task;
    if (id === undefined || id === null) {
      return { error: CLIENT_ERROR };
    }
    if (todo_id === undefined || todo_id === null) {
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

    const updatedTask = await updateTask(task, todo_uuid, this.env);
    const { error } = updatedTask;
    if (error) return { error: CLIENT_ERROR };
    const result = {
      cmd,
      payload: {
        todo_uuid,
        task: updatedTask as Task,
      },
    };
    return {
      payload: result,
    };
  }
}
