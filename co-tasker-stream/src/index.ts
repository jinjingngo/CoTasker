/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import template from './template';

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

let count = 0;

async function handleSession(websocket: WebSocket) {
	websocket.accept();
	websocket.addEventListener('message', async ({ data }) => {
		if (data === 'CLICK') {
			count += 1;
			websocket.send(JSON.stringify({ count, tz: new Date() }));
		} else {
			// An unknown message came into the server. Send back an error message
			websocket.send(JSON.stringify({ error: 'Unknown message received', tz: new Date() }));
		}
	});

	websocket.addEventListener('close', async (evt) => {
		// Handle when a client closes the WebSocket connection
		console.log(evt);
	});
}

const websocketHandler = async (request: Request) => {
	const upgradeHeader = request.headers.get('Upgrade');
	if (upgradeHeader !== 'websocket') {
		return new Response('Expected websocket', { status: 400 });
	}

	const [client, server] = Object.values(new WebSocketPair());
	await handleSession(server);

	return new Response(null, {
		status: 101,
		webSocket: client,
	});
};

const streamer = {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// return new Response('Hello World!');
		try {
			const url = new URL(request.url);
			switch (url.pathname) {
				case '/':
					return template();
				case '/ws':
					return websocketHandler(request);
				default:
					return new Response('Not found', { status: 404 });
			}
		} catch (err) {
			return new Response(err.toString());
		}
	},
};

export default streamer;
