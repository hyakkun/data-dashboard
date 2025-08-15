import type { NextApiRequest, NextApiResponse } from "next";

async function deleteFile(req: NextApiRequest, res: NextApiResponse) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: { message: "IDが指定されていません" } });
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL + `/files/${id}`;
    let backendRes;
    try {
      backendRes = await fetch(backendUrl, {
        method: 'DELETE',
      });
    } catch {
      return res.status(502).json({ error: '通信エラー' });
    }

    const data = await backendRes.json();
    return res.status(backendRes.status).json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'サーバーエラー';
    return res.status(500).json({ error: message });
  }
}

async function getFileDetail(req: NextApiRequest, res: NextApiResponse) {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: { message: "IDが指定されていません" } });
  }

    try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL + `/files/${id}`;
    let backendRes;
    try {
      backendRes = await fetch(backendUrl, {
        method: 'GET',
      });
    } catch {
      return res.status(502).json({ error: '通信エラー' });
    }

    const data = await backendRes.json();
    return res.status(backendRes.status).json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'サーバーエラー';
    return res.status(500).json({ error: message });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method == "DELETE") {
    return deleteFile(req, res);
  } else if (req.method == "GET") {
    return getFileDetail(req, res);
  }
  return res.status(405).json({ error: { message: "Method Not Allowed" } });
}