import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: { message: "Method Not Allowed" } });
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL + "/files";
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