"use client";

import React, { useState } from "react";
import { FileList, FileItem } from "./FileList";

export const FileListContainer = () => {
  // ダミーデータ（ここはAPIから取得したファイル一覧を使う想定）
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: "uuid-1",
      name: "sample.csv",
      rows: 100,
      uploadedAt: "2025-08-11T21:00:00Z",
      size: 10240,
    },
    {
      id: "uuid-2",
      name: "logs.csv",
      rows: 3000,
      uploadedAt: "2025-08-10T10:00:00Z",
      size: 204800,
    },
  ]);

  // ダウンロードボタンが押されたら呼ばれる
  const handleDownload = (file: FileItem) => {
    alert(`Downloading file: ${file.name}`);
    // ここで実際はAPIにGETリクエスト飛ばす等の処理を書く
  };

  // 削除ボタンが押されたら呼ばれる
  const handleDelete = (file: FileItem) => {
    alert(`Deleting file: ${file.name}`);
    // API呼び出しして削除、削除成功後に一覧更新など
  };

  // ファイル名クリックで詳細画面に遷移する処理
  const handleNavigateDetail = (file: FileItem) => {
    alert(`Navigate to detail screen of: ${file.name}`);
    // ここで react-router の useNavigate などを使って遷移させる想定
  };

  return (
    <FileList
      files={files}
      onDownload={handleDownload}
      onDelete={handleDelete}
      onNavigateDetail={handleNavigateDetail}
    />
  );
};