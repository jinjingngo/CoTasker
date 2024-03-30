import { NextRequest, NextResponse } from "next/server";
import { validate } from "uuid";
import {
  CLIENT_ERROR,
  CLIENT_ERROR_CODE,
  HTTP_OK,
  HTTP_OK_CODE,
  SERVER_ERROR,
  SERVER_ERROR_CODE,
} from "../../common_error";
import { Todo } from "@/shared/schemas";
import { deleteTodo, updateTodo } from "../../db/todo";

type DeletePathParam = { params: { uuid: string } };

type PatchPathParam = DeletePathParam;

type PatchBody = Pick<Todo, "title">;

export async function PATCH(request: NextRequest, { params }: PatchPathParam) {
  try {
    const { uuid } = params;
    const isValid = validate(uuid);

    if (!isValid) {
      return NextResponse.json(CLIENT_ERROR, CLIENT_ERROR_CODE);
    }

    const body: PatchBody = await request.json();
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

    const todo = await updateTodo(uuid, title);
    if (!todo) {
      console.error(`[API todo > PATCH] ${SERVER_ERROR.error}`);
    }

    return NextResponse.json(todo || SERVER_ERROR, {
      status: todo ? HTTP_OK_CODE.status : SERVER_ERROR_CODE.status,
    });
  } catch (error) {
    console.error("[API todo > PATCH] error: ", error);
    return NextResponse.json(CLIENT_ERROR, CLIENT_ERROR_CODE);
  }
}

export async function DELETE(_: NextRequest, { params }: DeletePathParam) {
  const { uuid } = params;
  const isValid = validate(uuid);

  if (!isValid) {
    return NextResponse.json(CLIENT_ERROR, CLIENT_ERROR_CODE);
  }

  const result = await deleteTodo(uuid);
  if (!result) {
    console.error(`[API todo > DELETE] ${SERVER_ERROR.error}`);
    return NextResponse.json(SERVER_ERROR, SERVER_ERROR_CODE);
  }

  const { rowCount } = result;

  return NextResponse.json(rowCount ? HTTP_OK : CLIENT_ERROR, {
    status: rowCount ? HTTP_OK_CODE.status : CLIENT_ERROR_CODE.status,
  });
}
