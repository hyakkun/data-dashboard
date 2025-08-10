import React from "react";

export default function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center flex-col space-y-2">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-400 border-t-transparent"></div>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}