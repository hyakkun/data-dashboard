"use client";

import React from "react";
import { use, useEffect } from "react";
import { FiDownload } from "react-icons/fi";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

import { FileItem } from "@/app/components/FileList";
import LoadingSpinner from "@/app/components/LoadingSpinner";

export default function FileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrapParams = use(params);
  const id = unwrapParams.id;
  const [file, setFile] = React.useState<FileItem | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [data, setData] = React.useState<{ date: string; count: number }[] | null>(null);
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

  const loadFileSummary = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/summary/${id}`, {
        method: "GET",
      });
      const data = await res.json();
      setData(data.summary || []);
    } catch (e) {
      console.error("ファイルのサマリー取得に失敗しました", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof id === "string") {
      loadFileDetail(id);
      loadFileSummary(id);
    } else {
      setFile(null);
      setData([]);
    }
  }, [id]);

  return (
    <main className="justify-center flex flex-col items-center">
      <h2 className="text-xl mt-4 font-bold">ファイル詳細: {file?.filename}</h2>
      {isLoading ? (
        <LoadingSpinner />
      ) : file ? (
        <div>
          <div className="m-4 grid grid-cols-6 gap-4">
            <div className="col-span-5">
              <p>ファイルID: {id}</p>
              <p>アップロード日時: {new Date(file.uploaded_at).toLocaleString()}</p>
              <p>ファイルサイズ: {file.filesize} bytes</p>
              <p>データ行数: {file.row_count}</p>
              <p>カラム: {file.columns}</p>
            </div>
            <div className="place-content-center">
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => window.location.href = `/api/files/${id}/download`}>
                <FiDownload />
              </button>
            </div>
          </div>
          {data && data.length > 0 ? (
          <div className="flex justify-center m-4">
            <div className="w-full h-96 p-4">
              <h2 className="text-lg font-bold mb-4">日別ログ件数</h2>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          ) : (
            <p className="text-center">日別ログ件数のデータがありません</p>
          )}
        </div>
      ) : (
        <p>ファイルが見つかりません</p>
      )}
      <div className="justify-end flex mt-4">
        <button className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
          onClick={() => window.location.href = "/"}>ファイル一覧に戻る</button>
      </div>
    </main>
  );
}