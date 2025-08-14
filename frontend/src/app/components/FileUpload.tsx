"use client";

import React, { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface FileUploadProps {
  onClose: () => void;
  onUploadSuccess: () => void; // アップロード成功時のコールバック
}

export default function FileUploadModal({ onClose, onUploadSuccess }: FileUploadProps) {
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
    e.target.value = "";
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

    // 開発環境ではアップロードの遅延をシミュレート
    if (process.env.NODE_ENV === "development") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        let errorMsg = "";
        if (data?.error) {
          if (typeof data.error === "string") {
            errorMsg = data.error;
          } else if (typeof data.error === "object") {
            if (data.error.message) {
              errorMsg = data.error.message;
            }
            if (Array.isArray(data.error.details)) {
              errorMsg += "：" + data.error.details.map((d: { msg: string }) => d.msg).join(" / ");
            }
            if (data.error.detail) {
              if (typeof data.error.detail === "string") {
                errorMsg = data.error.detail;
              } else if (Array.isArray(data.error.detail)) {
                errorMsg += ":" + data.error.detail.map((d: { msg: string }) => d.msg).join(" / ");
              }
            }
          }
        }
        throw new Error(errorMsg);
      }

      setSuccess({
        fileName: file.name,
        rows: data.data.rows,
        columns: data.data.columns, // カラム名の配列
      });
      onUploadSuccess();
      setFile(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'サーバーエラー';
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="relative max-w-md mx-auto mt-12 p-6 bg-white shadow-lg rounded-lg">
        {isUploading && <LoadingSpinner />}
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          ファイルアップロード
        </h2>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
            disabled={isUploading}
          >
            キャンセル
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          CSVファイルを選択してアップロードしてください。
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            data-testid="drop-zone"
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
        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-500 text-sm p-4 rounded text-center">
            <p>アップロードに失敗しました</p>
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="mt-4 bg-green-100 border border-green-400 text-green-600 text-sm p-4 rounded text-center">
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
      </div>
    </div>
  );
}
