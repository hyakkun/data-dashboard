// import FileUpload from "./components/FileUpload";
import { FileListContainer } from "./components/FileListContainer";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      {/* <h1 className="text-3xl font-bold mb-4">CSVファイルアップロード</h1>
      <FileUpload /> */}
      <FileListContainer />
    </main>
  );
}