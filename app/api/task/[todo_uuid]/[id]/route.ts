import { NextRequest, NextResponse } from "next/server";
import { validate } from "uuid";
import { deleteTask, updateTask } from "../../../db/task";
import {
  CLIENT_CLONE_ERROR,
  CLIENT_ERROR,
  CLIENT_ERROR_CODE,
  HTTP_OK,
  HTTP_OK_CODE,
  SERVER_ERROR,
  SERVER_ERROR_CODE,
} from "../../../common_error";

import type { UpdatePathParam, UpdateTask } from "@/app/api/types";

export async function PATCH(request: NextRequest, pathParam: UpdatePathParam) {
  try {
    const {
      params: { todo_uuid, id },
    } = pathParam;

    if (!validate(todo_uuid)) {
      return NextResponse.json(CLIENT_ERROR, CLIENT_ERROR_CODE);
    }

    const body: UpdateTask = await request.json();
    // TODO: need to check the spec, if this situation happens
    //  I guess this situation won't happen,
    //  there has to be a fallback in `Request.json()`'s implementation
    //  ref: https://fetch.spec.whatwg.org/#dom-body-json
    if (!body) {
      return NextResponse.json(CLIENT_ERROR, CLIENT_ERROR_CODE);
    }

    if (id === undefined || id === null) {
      return NextResponse.json(CLIENT_ERROR, CLIENT_ERROR_CODE);
    }

    const { parent_id, title, notes, status } = body;

    console.log({ parent_id, title, notes, status });

    if (
      (parent_id === undefined || parent_id === null) &&
      !title &&
      !notes &&
      !status
    ) {
      return NextResponse.json(CLIENT_ERROR, CLIENT_ERROR_CODE);
    }

    if (id === parent_id) {
      return NextResponse.json(CLIENT_CLONE_ERROR, CLIENT_ERROR_CODE);
    }

    const task = {
      id,
      parent_id,
      title,
      notes,
      status,
    };
    const updatedTask = await updateTask(task);

    return NextResponse.json(updatedTask || SERVER_ERROR, {
      status: updatedTask ? HTTP_OK_CODE.status : SERVER_ERROR_CODE.status,
    });
  } catch (error) {
    console.error("[API task > PATCH] error: ", error);
    return NextResponse.json(CLIENT_ERROR, CLIENT_ERROR_CODE);
  }
}

export async function DELETE(_: NextRequest, pathParam: UpdatePathParam) {
  const {
    params: { todo_uuid, id },
  } = pathParam;

  if (!validate(todo_uuid)) {
    return NextResponse.json(CLIENT_ERROR, CLIENT_ERROR_CODE);
  }

  if (id === undefined || id === null) {
    return NextResponse.json(CLIENT_ERROR, CLIENT_ERROR_CODE);
  }

  const result = await deleteTask(Number(id));
  if (!result) {
    console.error(`[API todo > DELETE] ${SERVER_ERROR.error}`);
    return NextResponse.json(SERVER_ERROR, SERVER_ERROR_CODE);
  }

  const { rowCount } = result;

  return NextResponse.json(rowCount ? HTTP_OK : CLIENT_ERROR, {
    status: rowCount ? HTTP_OK_CODE.status : CLIENT_ERROR_CODE.status,
  });
}
