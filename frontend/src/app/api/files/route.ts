import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const reqFormData = await req.formData();
    const file = reqFormData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "ファイルが見つかりません" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const blob = new Blob([bytes], { type: file.type || "application/octet-stream" });

    const formData = new FormData();
    formData.append("file", blob, file.name);

    const backendUrl = process.env.NEXT_PUBLIC_API_URL + "/files";
    let backendRes;
    try {
      backendRes = await fetch(backendUrl, {
        method: 'POST',
        body: formData as unknown as BodyInit,
      });
    } catch {
      return NextResponse.json({ error: "通信エラー" }, { status: 502 });
    }

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'サーバーエラー';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL + "/files";
    let backendRes;
    try {
      backendRes = await fetch(backendUrl, {
        method: 'GET',
      });
    } catch {
      return NextResponse.json({ error: "通信エラー" }, { status: 502 });
    }

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'サーバーエラー';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}