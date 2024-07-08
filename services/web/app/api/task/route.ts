import { NextRequest, NextResponse } from 'next/server';
import { HTTP_OK_CODE } from '../common_error';

export async function GET(_: NextRequest) {
  return NextResponse.json([], HTTP_OK_CODE);
}
