import type { NextApiRequest, NextApiResponse } from "next";

async function downloadFile(req: NextApiRequest, res: NextApiResponse) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: { message: "IDが指定されていません" } });
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL + `/files/${id}/download`;
    let backendRes;
    try {
      backendRes = await fetch(backendUrl, {
        method: 'GET',
      });
    } catch {
      return res.status(502).json({ error: '通信エラー' });
    }

    if (!backendRes.ok) {
      const data = await backendRes.json();
      return res.status(backendRes.status).json(data);
    } else {
      const contentType = backendRes.headers.get("content-type") || "application/octet-stream";
      const contentDisposition = backendRes.headers.get("content-disposition") || `attachment; filename="${id}"`;
      const fileBuffer = Buffer.from(await backendRes.arrayBuffer());

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", contentDisposition);
      res.setHeader("Content-Length", fileBuffer.length);

      return res.status(200).send(fileBuffer);
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'サーバーエラー';
    return res.status(500).json({ error: message });
  }
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == "GET") {
    return downloadFile(req, res);
  }
  return res.status(405).json({ error: { message: "Method Not Allowed" } });
}