import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { IncomingForm, File as FormidableFile } from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (
  req: NextApiRequest
): Promise<{
  fields: { [key: string]: string | string[] | undefined };
  files: { [key: string]: FormidableFile | FormidableFile[] | undefined };
}> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ multiples: false });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method Not Allowed" } });
  }

  try {
    const { files } = await parseForm(req);
    let fileEntry = files.file;
    if (Array.isArray(fileEntry)) {
      fileEntry = fileEntry[0];
    }
    const file = fileEntry as FormidableFile;
    if (!file) {
      return res.status(400).json({ error: { message: "ファイルが見つかりません" } });
    }

    const formData = new FormData();
    const fileBuffer = fs.readFileSync(file.filepath);
    const blob = new Blob([fileBuffer], { type: file.mimetype ?? "application/octet-stream" });
    formData.append('file', blob, file.originalFilename ?? 'uploaded_file');

    const backendUrl = process.env.NEXT_PUBLIC_API_URL + "/files";
    let backendRes;
    try {
      backendRes = await fetch(backendUrl, {
        method: 'POST',
        body: formData as unknown as BodyInit,
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