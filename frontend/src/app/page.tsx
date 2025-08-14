"use client";

import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import { FileListContainer } from "./components/FileListContainer";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">アップロード済みファイル一覧</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          アップロード
        </button>
      </div>

      <FileListContainer />

      {isModalOpen && (
        <FileUpload
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </main>
  );
}