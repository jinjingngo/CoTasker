import {
  describe,
  beforeEach,
  expect,
  vi,
  it,
  MockInstance,
  afterEach,
} from "vitest";
import { NextRequest } from "next/server";

import { GET, POST } from "./route";
import { TEST_BASE_URL } from "../../util";
import * as todo from "../db/todo";
import {
  CLIENT_ERROR,
  CLIENT_ERROR_CODE,
  HTTP_OK_CODE,
  SERVER_ERROR,
  SERVER_ERROR_CODE,
} from "../common_error";

describe("Todo Route Handlers", () => {
  describe("GET /api/todo", () => {
    let spy: MockInstance | null;
    let url: URL | null;
    let req: NextRequest | null;

    beforeEach(() => {
      url = new URL("/", TEST_BASE_URL);
      req = new NextRequest(url!);
      spy = vi.spyOn(todo, "queryTodos");
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return Server Error", async () => {
      spy!.mockImplementationOnce(() => undefined);
      const res = await GET(req!);
      const body = await res.json();

      expect(body).toEqual(SERVER_ERROR);
      expect(res.status).toBe(SERVER_ERROR_CODE.status);
    });

    it("should return todos", async () => {
      const expected = { todo: [], total: 0 };

      spy!.mockImplementationOnce(() => expected);
      const res = await GET(req!);
      const body = await res.json();

      expect(body).toEqual(expected);
      expect(res.status).toBe(HTTP_OK_CODE.status);
    });
  });

  describe("POST /api/todo", () => {
    let spy: MockInstance | null;
    let url: URL | null;

    beforeEach(() => {
      url = new URL("/", TEST_BASE_URL);
      spy = vi.spyOn(todo, "createTodo");
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should return Client Error", async () => {
      const req = new NextRequest(url!, {});
      const res = await POST(req);
      const body = await res.json();

      expect(body).toEqual(CLIENT_ERROR);
      expect(res.status).toBe(CLIENT_ERROR_CODE.status);
    });

    it("should return Server Error because request body is `undefined`", async () => {
      const req = new NextRequest(url!, {
        method: "POST",
      });
      const res = await POST(req);
      const data = await res.json();

      expect(data).toEqual(CLIENT_ERROR);
      expect(res.status).toBe(CLIENT_ERROR_CODE.status);
    });

    it("should return Server Error because `title` is missing in request body", async () => {
      const req = new NextRequest(url!, {
        method: "POST",
        body: JSON.stringify({}),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(data).toEqual(CLIENT_ERROR);
      expect(res.status).toBe(CLIENT_ERROR_CODE.status);
    });

    it("should return Server Error", async () => {
      spy!.mockImplementationOnce(() => undefined);
      const payload = {
        title: "ToDo the First Born",
      };

      const req = new NextRequest(url!, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(data).toEqual(SERVER_ERROR);
      expect(res.status).toBe(SERVER_ERROR_CODE.status);
    });

    it("should return a todo", async () => {
      const expected = {
        title: "ToDo the First Born",
      };
      spy!.mockImplementationOnce(() => expected);

      const req = new NextRequest(url!, {
        method: "POST",
        body: JSON.stringify(expected),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(data).toEqual(expected);
      expect(res.status).toBe(HTTP_OK_CODE.status);
    });
  });
});
