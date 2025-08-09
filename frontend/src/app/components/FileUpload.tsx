"use client";

import { useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");

  const handleUpload = async () => {
    if (!file) {
      setMessage("CSVファイルを選択してください。");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(`エラー: ${data.error?.message ?? data.detail}`);
      } else {
        setMessage(`成功: 行数=${data.data.rows}, 列=${data.data.columns.join(", ")}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(`通信エラー: ${err.message}`);
      }
      else {
        setMessage("通信エラー: 不明なエラー");
      }
    }
  };

  return (
    <div className="p-4 space-y-2">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block"
      />
      <button onClick={handleUpload} className="btn btn-primary">
        CSVをアップロード
      </button>
      {message && <div className="mt-2 text-sm">{message}</div>}
    </div>
  );
}