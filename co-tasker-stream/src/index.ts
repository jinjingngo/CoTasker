import { validate } from 'uuid';
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

const modules = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    try {
      const { pathname } = new URL(request.url);
      const [, , todo_uuid] = pathname.split('/');
      if (!todo_uuid)
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
        });

      const isValid = validate(todo_uuid);
      if (!isValid)
        return new Response(JSON.stringify({ error: 'Invalid `todo_uuid`' }), {
          status: 404,
        });

      const id = env.Streamer.idFromName(`co-tasker-streamer-${todo_uuid}`);
      const stub = env.Streamer.get(id);
      return stub.fetch(request);
    } catch (err) {
      return new Response(JSON.stringify({ error: err }));
    }
  },
};

export default modules;
