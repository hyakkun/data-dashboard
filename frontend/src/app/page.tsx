"use client";

import { FileListContainer } from "./components/FileListContainer";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <FileListContainer />
    </main>
  );
}