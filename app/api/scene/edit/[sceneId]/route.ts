import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return NextResponse.json({ message: "scene editor" }, { status: 501 });
}
