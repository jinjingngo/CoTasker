// test/index.spec.ts
import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { UnstableDevWorker, unstable_dev } from 'wrangler';

describe('Streamer', () => {
	let streamer: UnstableDevWorker;

	beforeAll(async () => {
		streamer = await unstable_dev('src/index.ts', {
			experimental: { disableExperimentalWarning: true },
		});
	});

	afterAll(async () => {
		await streamer.stop();
	});

	it('should return Hello World', async () => {
		const resp = await streamer.fetch();
		if (resp) {
			const text = await resp.text();
			expect(text).toMatchInlineSnapshot(`"Hello World!"`);
		}
	});
});
