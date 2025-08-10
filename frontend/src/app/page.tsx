import FileUpload from "./components/FileUpload";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">CSVファイルアップロード</h1>
      <FileUpload />
    </main>
  );
}