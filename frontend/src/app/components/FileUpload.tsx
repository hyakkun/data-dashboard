"use client";

import React, { useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [success, setSuccess] = useState<{
    fileName: string;
    rows: number;
    columns: string[];
  } | null>(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const validateFile = (selected: File | null) => {
    if (!selected) {
      return { valid: false, message: "ファイルが選択されていません。" };
    }
    const ext = selected.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv') {
      return { valid: false, message: "CSVファイルのみ選択可能です。" };
    }
    if (selected.size > MAX_FILE_SIZE) {
      return { valid: false, message: "ファイルサイズは5MB以下にしてください。" };
    }
    return { valid: true, message: "" };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    const { valid, message } = validateFile(selected);
    if (!valid) {
      setError(message);
      setFile(null);
    } else {
      setError(null);
      setFile(selected);
    }
    setSuccess(null);
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    const { valid, message } = validateFile(droppedFile);
    if (!valid) {
      setError(message);
      setFile(null);
    } else {
      setError(null);
      setFile(droppedFile);
    }
    setSuccess(null);
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
      setSuccess({
        fileName: file.name,
        rows: data.data.rows,
        columns: data.data.columns, // カラム名の配列
      });
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

        {error && <p className="bg-red-100 border border-red-400 text-red-500 text-sm p-4 rounded text-center">{error}</p>}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-600 text-sm p-4 rounded text-center">
            <p>アップロード完了: {success.fileName}</p>
            <p>行数: {success.rows}</p>
            <p>カラム名</p>
            <ul className="list-disc list-inside">
              {success.columns.map((col, i) => (
                <li key={i}>{col}</li>
              ))}
            </ul>
          </div>
        )}
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
