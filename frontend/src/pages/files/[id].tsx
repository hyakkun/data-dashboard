import React from "react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { FiDownload } from "react-icons/fi";

import { FileItem } from "@/app/components/FileList";
import LoadingSpinner from "@/app/components/LoadingSpinner";

export default function FileDetailPage() {
  const router = useRouter();
  const { id } = router.query;
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
            <p>ファイルID: {file.file_id}</p>
            <p>アップロード日時: {new Date(file.uploaded_at).toLocaleString()}</p>
            <p>ファイルサイズ: {file.filesize} bytes</p>
            <p>データ行数: {file.row_count}</p>
            <button onClick={() => window.open(`/api/files/${file.file_id}/download`, "_blank")}>
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
        <button onClick={() => router.push("/")}>ファイル一覧に戻る</button>
      </div>
    </main>
  );
}