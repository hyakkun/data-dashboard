"use client";

import React, { useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setSuccess(null);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError(null);
      setSuccess(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("ファイルを選択してください");
      return;
    }

    setIsUploading(true);
    setSuccess(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("アップロードに失敗しました");

      const data = await res.json();
      setSuccess(`アップロード完了: ${file.name} 行数=${data.data.rows}`);
      setFile(null);
    } catch {
      setError("アップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        ファイルアップロード
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        CSVファイルを選択してアップロードしてください。
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          onDragOver={handleDragOver} onDrop={handleDrop} onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition 
          ${isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"}`}
        >
          <p className="text-sm text-gray-600">
            ファイルをここにドラッグ&ドロップ
          </p>
          <p className="text-sm text-gray-600 my-2">
            または
          </p>
          <label className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 cursor-pointer">
            ファイルを選択
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <div className="mt-2 text-sm text-gray-700">
            {file ? file.name : "ファイルが選択されていません"}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={!file || isUploading}
          className={`w-full py-2 px-4 rounded-md text-white font-semibold transition 
            ${!file || isUploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {isUploading ? "アップロード中..." : "アップロード"}
        </button>
      </form>
    </div>
  );
}
