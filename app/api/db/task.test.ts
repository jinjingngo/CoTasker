import {
  MockInstance,
  describe,
  beforeEach,
  afterEach,
  vi,
  it,
  expect,
} from "vitest";
import { Pool } from "pg";

import { queryTaskByTodoUUID } from "./task";
import * as db from "../client/db";

describe("DB Task", () => {
  describe("queryTaskByTodoUUID", () => {
    let spy: MockInstance<[], Pool> | null = null;
    beforeEach(() => {
      spy = vi.spyOn(db, "getDBPool");
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return `undefined` because getDBPool throws an error", async () => {
      spy!.mockImplementationOnce(() => {
        throw Error();
      });
      const tasks = await queryTaskByTodoUUID("fake-uuid");
      expect(tasks).toBeUndefined();
    });

    it("should return `undefined` because query throws an error", async () => {
      spy!.mockImplementationOnce(() => {
        return {
          query: () => {
            throw Error();
          },
        } as unknown as Pool;
      });
      const tasks = await queryTaskByTodoUUID("fake-uuid");
      expect(tasks).toBeUndefined();
    });

    it("should return expected array", async () => {
      spy!.mockImplementationOnce(() => {
        return {
          query: () => {
            return { rows: [] };
          },
        } as unknown as Pool;
      });

      const tasks = await queryTaskByTodoUUID("fake-uuid");
      expect(tasks).toStrictEqual([]);
    });
  });
});
