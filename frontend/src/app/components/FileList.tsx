import React, { useState } from "react";
import { FiDownload, FiTrash2, FiChevronDown, FiChevronUp } from "react-icons/fi";
export interface FileItem {
  file_id: string;
  filename: string;
  row_count: number;
  uploaded_at: string; // ISO文字列想定
  filesize: number; // バイト
}

interface FileListProps {
  files: FileItem[];
  onDownload: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onNavigateDetail: (file: FileItem) => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onDownload,
  onDelete,
  onNavigateDetail,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (file_id: string) => {
    setExpandedId(expandedId === file_id ? null : file_id);
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString();

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="max-w-4xl mx-auto mt-4">
      <ul className="divide-y divide-gray-300 file-list">
        {files.map((file) => (
          <li key={file.file_id} className="file-card">
            {/* メイン行 */}
            <div
              className="flex items-center justify-between cursor-pointer hover:bg-gray-100"
              onClick={() => toggleExpand(file.file_id)}
            >
              <div className="flex items-center space-x-4">
                <span
                  className={"inline-block transform transition-transform"}
                  aria-label={expandedId === file.file_id ? "閉じる" : "開く"}
                >
                  {expandedId === file.file_id ? <FiChevronUp /> : <FiChevronDown />}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateDetail(file);
                  }}
                  className="text-blue-600 hover:underline text-left"
                >
                  {file.filename}
                </button>
              </div>

              <div className="ml-4 text-gray-600 text-sm">
                {file.row_count} 行 / {formatDate(file.uploaded_at)}
              </div>
            </div>

            {/* 展開部分 */}
            {expandedId === file.file_id && (
              <div className="bg-gray-50 p-2 mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="text-gray-700">
                  サイズ: {formatSize(file.filesize)}
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => onDownload(file)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    aria-label="ダウンロード"
                  >
                    <FiDownload />
                  </button>
                  <button
                    onClick={() => onDelete(file)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800"
                    aria-label="削除"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};