export class Streamer {
	private clients = new Set<WebSocket>();

	constructor(state: DurableObjectState, env: Env) {
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
		server.addEventListener('message', (message) => this.broadcast(message, server));
		server.addEventListener('close', () => this.clients.delete(server));

		return new Response(null, { status: 101, webSocket: client });
	}

	broadcast(message: MessageEvent, server: WebSocket) {
		console.log({ data: message.data });
		const { data } = message;
		const clients = [...this.clients].filter((client) => client !== server);
		clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(data);
			}
		});
	}
}
