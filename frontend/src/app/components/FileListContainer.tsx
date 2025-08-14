"use client";

import React, { useState, useEffect } from "react";
import { FileList, FileItem } from "./FileList";
import LoadingSpinner from "./LoadingSpinner";

export const FileListContainer = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/files", {
        method: "GET",
      });
      const data = await res.json();
      setFiles(data);
    } catch (e) {
      console.error("ファイル一覧の取得に失敗しました", e);
    } finally {
      setIsLoading(false);
    }
  };

  // ダウンロードボタンが押されたら呼ばれる
  const handleDownload = (file: FileItem) => {
    alert(`Downloading file: ${file.filename}`);
    // ここで実際はAPIにGETリクエスト飛ばす等の処理を書く
  };

  // 削除ボタンが押されたら呼ばれる
  const handleDelete = (file: FileItem) => {
    if (confirm("削除してもよろしいですか？")) {
      alert(`Deleting file: ${file.filename}`);
      // await deleteFile(id);
      loadFiles()
    }
    // API呼び出しして削除、削除成功後に一覧更新など
  };

  // ファイル名クリックで詳細画面に遷移する処理
  const handleNavigateDetail = (file: FileItem) => {
    alert(`Navigate to detail screen of: ${file.filename}`);
    // ここで react-router の useNavigate などを使って遷移させる想定
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <div>
      {isLoading && <LoadingSpinner />}
      {files.length === 0 && !isLoading && (
        <div className="text-center text-gray-500 mt-8">
          アップロードされたファイルはありません。
        </div>
      )}
      {files.length > 0 && !isLoading && (
        <FileList
          files={files}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onNavigateDetail={handleNavigateDetail}
        />
      )}
    </div>
  );
};