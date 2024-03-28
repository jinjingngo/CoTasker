import { NextRequest, NextResponse } from "next/server";
import { TODO_PAGINATION_LIMIT } from "../../util";
import { createTodo, queryTodos } from "../db/todo";
import { Todo } from "@/shared/schemas";
import {
  HTTP_OK_CODE,
  SERVER_ERROR,
  SERVER_ERROR_CODE,
  CLIENT_ERROR,
  CLIENT_ERROR_CODE,
} from "../common_error";

type TodoCreateRequest = Partial<Todo> | undefined;

export async function GET(request: NextRequest) {
  const {
    nextUrl: { searchParams },
  } = request;

  const offset = searchParams.get("offset") || 0;
  const limit = searchParams.get("limit") || TODO_PAGINATION_LIMIT;

  const todos = await queryTodos(Number(offset), Number(limit));
  if (!todos) {
    console.error(`[API todo > GET] ${SERVER_ERROR.error}`);
  }

  return NextResponse.json(todos || SERVER_ERROR, {
    status: todos ? HTTP_OK_CODE.status : SERVER_ERROR_CODE.status,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: TodoCreateRequest = await request.json();
    // TODO: need to check the spec, if this situation happens
    //  I guess this situation won't happen,
    //  there has to be a fallback in `Request.json()`'s implementation
    //  ref: https://fetch.spec.whatwg.org/#dom-body-json
    if (!body) {
      return NextResponse.json(CLIENT_ERROR, CLIENT_ERROR_CODE);
    }
    const { title } = body;
    if (!title) {
      return NextResponse.json(CLIENT_ERROR, CLIENT_ERROR_CODE);
    }

    const todo = await createTodo(title);
    if (!todo) {
      console.error(`[API todo > POST] ${SERVER_ERROR.error}`);
    }

    return NextResponse.json(todo || SERVER_ERROR, {
      status: todo ? HTTP_OK_CODE.status : SERVER_ERROR_CODE.status,
    });
  } catch (error) {
    console.error("[API todo > POST] error: ", error);
    return NextResponse.json(CLIENT_ERROR, CLIENT_ERROR_CODE);
  }
}
