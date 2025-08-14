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
  const handleDelete = async (file: FileItem) => {
    if (confirm(`${file.filename} を削除してもよろしいですか？`)) {
      try {
        const res = await fetch(`/api/files/${file.file_id}`, {
          method: "DELETE",
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
        loadFiles();
      } catch (e) {
        console.error("ファイルの削除に失敗しました", e);
      }
    }
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