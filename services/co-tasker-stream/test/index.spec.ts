import { env, createExecutionContext } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import streamer from '../src';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('Streamer', () => {
  it('should return html document', async () => {
    const ctx = createExecutionContext();
    const resp = await streamer.fetch(new IncomingRequest(''), env, ctx);
    if (resp) {
      const text = await resp.text();
      console.log(text);
      expect(text).toBeTruthy();
    }
  });
});
