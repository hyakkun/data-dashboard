import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unwrapParams = await params;
  const id  = unwrapParams.id;

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL + `/files/${id}`;
    let backendRes;
    try {
      backendRes = await fetch(backendUrl, {
        method: 'DELETE',
      });
    } catch {
      return NextResponse.json({ error: '通信エラー' }, { status: 502 });
    }

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'サーバーエラー';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unwrapParams = await params;
  const id  = unwrapParams.id;

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL + `/files/${id}`;
    let backendRes;
    try {
      backendRes = await fetch(backendUrl, {
        method: 'GET',
      });
    } catch {
      return NextResponse.json({ error: '通信エラー' }, { status: 502 });
    }

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'サーバーエラー';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}