/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// In order for the workers runtime to find the class that implements
// our Durable Object namespace, we must export it from the root module.
export { Streamer } from './Streamer';

import template from './template';

const modules = {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		try {
			const url = new URL(request.url);
			switch (url.pathname) {
				case '/':
					return template();
				case '/ws':
					const id = env.Streamer.idFromName('co-tasker-streamer');
					const stub = env.Streamer.get(id);
					return stub.fetch(request);
				default:
					return new Response('Not found', { status: 404 });
			}
		} catch (err) {
			return new Response(JSON.stringify({ error: err }));
		}
	},
};
export default modules;
