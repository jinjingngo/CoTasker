import { NextRequest, NextResponse } from 'next/server';
import {
  CLIENT_ERROR,
  CLIENT_ERROR_CODE,
  HTTP_OK_CODE,
  SERVER_ERROR,
  SERVER_ERROR_CODE,
} from '../../common_error';
import { createTask, queryTasksByTodoUUID } from '../../db/task';
import { PathParam, PostTask } from '../../types';
import { validate } from 'uuid';

export async function GET(_: NextRequest, pathParam: PathParam) {
  try {
    const {
      params: { todo_uuid },
    } = pathParam;

    if (!validate(todo_uuid)) {
      return NextResponse.json(CLIENT_ERROR, CLIENT_ERROR_CODE);
    }

    const tasks = await queryTasksByTodoUUID(todo_uuid);

    return NextResponse.json(tasks || SERVER_ERROR, {
      status: tasks ? HTTP_OK_CODE.status : SERVER_ERROR_CODE.status,
    });
  } catch (error) {
    console.error('[API task > GET] error: ', error);
    return NextResponse.json(CLIENT_ERROR, CLIENT_ERROR_CODE);
  }
}

export async function POST(request: NextRequest, pathParam: PathParam) {
  try {
    const {
      params: { todo_uuid },
    } = pathParam;

    if (!validate(todo_uuid)) {
      return NextResponse.json(CLIENT_ERROR, CLIENT_ERROR_CODE);
    }

    const body: PostTask = await request.json();
    // TODO: need to check the spec, if this situation happens
    //  I guess this situation won't happen,
    //  there has to be a fallback in `Request.json()`'s implementation
    //  ref: https://fetch.spec.whatwg.org/#dom-body-json
    if (!body) {
      return NextResponse.json(CLIENT_ERROR, CLIENT_ERROR_CODE);
    }

    const { parent_id, title, notes, status } = body;
    if (!title) {
      return NextResponse.json(CLIENT_ERROR, CLIENT_ERROR_CODE);
    }

    if (!status) {
      return NextResponse.json(CLIENT_ERROR, CLIENT_ERROR_CODE);
    }

    const task = {
      uuid: todo_uuid,
      parent_id,
      title,
      notes,
      status,
    };

    const insertedTask = await createTask(task);

    return NextResponse.json(insertedTask || SERVER_ERROR, {
      status: insertedTask ? HTTP_OK_CODE.status : SERVER_ERROR_CODE.status,
    });
  } catch (error) {
    console.error('[API task > POST] error: ', error);
    return NextResponse.json(CLIENT_ERROR, CLIENT_ERROR_CODE);
  }
}
