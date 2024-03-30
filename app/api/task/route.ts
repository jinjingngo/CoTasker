import { HTTP_OK_CODE } from '../common_error';

export async function GET(_: Request) {
  return Response.json([], HTTP_OK_CODE);
}
