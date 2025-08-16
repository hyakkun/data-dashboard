"use client";

import React from "react";
import { use, useEffect } from "react";
import { FiDownload } from "react-icons/fi";

import { FileItem } from "@/app/components/FileList";
import LoadingSpinner from "@/app/components/LoadingSpinner";

export default function FileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrapParams = use(params);
  const id = unwrapParams.id;
  const [file, setFile] = React.useState<FileItem | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  // TODO: APIで詳細データ取得して表示する実装へ

  const loadFileDetail = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/files/${id}`, {
        method: "GET",
      });
      const data = await res.json();
      setFile(data);
    } catch (e) {
      console.error("ファイル情報の取得に失敗しました", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof id === "string") {
      loadFileDetail(id);
    } else {
      setFile(null);
    }
  }, [id]);

  return (
    <main className="justify-center flex flex-col items-center">
      <h2>ファイル詳細: {file?.filename}</h2>
      {isLoading ? (
        <LoadingSpinner />
      ) : file ? (
        <div>
          <div className="m-4">
            <p>ファイルID: {id}</p>
            <p>アップロード日時: {new Date(file.uploaded_at).toLocaleString()}</p>
            <p>ファイルサイズ: {file.filesize} bytes</p>
            <p>データ行数: {file.row_count}</p>
            <button onClick={() => window.location.href = `/api/files/${id}/download`}>
              <FiDownload />ダウンロード
            </button>
          </div>
          <div className="flex justify-center">
            {/* summaryコンポーネントをここに追加 */}
          </div>
        </div>
      ) : (
        <p>ファイルが見つかりません</p>
      )}
      <div className="justify-end flex mt-4">
        <button onClick={() => window.location.href = "/"}>ファイル一覧に戻る</button>
      </div>
    </main>
  );
}