import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unwrapParams = await params;
  const id  = unwrapParams.id;
  if (!id) {
    return NextResponse.json({ error: "ファイルIDが指定されていません" }, { status: 400 });
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL + `/files/${id}/download`;
    let backendRes;
    try {
      backendRes = await fetch(backendUrl, {
        method: 'GET',
      });
    } catch {
      return NextResponse.json({ error: '通信エラー' }, { status: 502 });
    }

    if (!backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data, { status: backendRes.status });
    } else {
      const contentType = backendRes.headers.get("content-type") || "application/octet-stream";
      const contentDisposition = backendRes.headers.get("content-disposition") || `attachment; filename="${id}"`;

      const res = new Response(backendRes.body, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": contentDisposition,
        },
      });
      return res;
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'サーバーエラー';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}