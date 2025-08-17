"use client";

import React from "react";
import { use, useState, useEffect, useCallback } from "react";
import { FiDownload } from "react-icons/fi";
import {
  LineChart, Line, XAxis, YAxis, Legend, Tooltip, ResponsiveContainer
} from "recharts";

import { FileItem } from "@/app/components/FileList";
import LoadingSpinner from "@/app/components/LoadingSpinner";

type ApiResponse = {
  status: string;
  group_by: string;
  time_unit: string;
  categories: string[];
  summary: Record<string, string | number>[];
};

const timeUnitOptions = [
  { value: "day", label: "日" },
  { value: "hour", label: "時間" },
  { value: "10min", label: "10分" },
  { value: "5min", label: "5分" },
  { value: "1min", label: "1分" },
];

export default function FileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrapParams = use(params);
  const id = unwrapParams.id;
  const [file, setFile] = useState<FileItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [groupBy, setGroupBy] = useState("");
  const [timeUnit, setTimeUnit] = useState("day");
  const [data, setData] = useState<Record<string, string | number>[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const loadFileDetail = useCallback(async (id: string) => {
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
  }, []);

  const loadFileSummary = useCallback(async (id: string) => {
    if (!groupBy || !timeUnit) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/summary/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_by: groupBy, time_unit: timeUnit }),
      });
      const json: ApiResponse = await res.json();
      setData(json.summary);
      setCategories(json.categories);
    } catch (e) {
      console.error("ファイルのサマリー取得に失敗しました", e);
    } finally {
      setIsLoading(false);
    }
  }, [groupBy, timeUnit]);

  useEffect(() => {
    if (typeof id === "string") {
      loadFileDetail(id);
    } else {
      setFile(null);
      setData([]);
    }
  }, [id, loadFileDetail]);

  useEffect(() => {
    if (typeof id === "string") {
      loadFileSummary(id);
    }
  }, [id, groupBy, timeUnit, loadFileSummary]);

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
              <p>カラム: {file.columns.join(", ")}</p>
            </div>
            <div className="place-content-center">
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => window.location.href = `/api/files/${id}/download`}>
                <FiDownload />
              </button>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <label>
              集計軸:{" "}
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="border p-1 rounded"
              >
                <option value="">選択してください</option>
                {file.columns.filter(n => n !== "time_generated" && !n.includes("_ip")).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>

            <label>
              時間粒度:{" "}
              <select
                value={timeUnit}
                onChange={(e) => setTimeUnit(e.target.value)}
                className="border p-1 rounded"
              >
                {timeUnitOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {data && data.length > 0 ? (
            <div className="flex flex-col justify-center w-full h-96 p-4 mx-4 mt-4 mb-8">
              <h2 className="text-lg font-bold mb-4">ログ件数推移</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data} margin={{ top: 20, right: 20, bottom: 80, left: 20 }}>
                  <XAxis dataKey="time_bucket" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {categories.map((cat, idx) => (
                    <Line
                      key={cat}
                      type="monotone"
                      dataKey={cat}
                      stroke={`hsl(${(idx * 60) % 360}, 70%, 50%)`} // 動的に色を割り当て
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center">集計対象を選択してください</p>
          )}
        </div>
      ) : (
        <p>ファイルが見つかりません</p>
      )}
      <div className="flex justify-center mt-4">
        <button className="flex justify-end bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
          onClick={() => window.location.href = "/"}>ファイル一覧に戻る</button>
      </div>
    </main>
  );
}