import React from "react";
import { useRouter } from "next/router";

export default function FileDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  // TODO: APIで詳細データ取得して表示する実装へ

  return (
    <div>
      <h2>ファイル詳細: {id}</h2>
    </div>
  );
}