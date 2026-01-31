import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return NextResponse.json({ message: "Renderer to be implemented" }, { status: 501 });
}
