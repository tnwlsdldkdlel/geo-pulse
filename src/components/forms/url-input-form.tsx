"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UrlInputFormProps {
  size?: "default" | "large";
  className?: string;
}

export function UrlInputForm({ size = "default", className }: UrlInputFormProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const validateUrl = (value: string): boolean => {
    try {
      const urlObj = new URL(value.startsWith("http") ? value : `https://${value}`);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError("URL을 입력해주세요.");
      return;
    }

    if (!validateUrl(trimmedUrl)) {
      setError("올바른 URL 형식이 아닙니다.");
      return;
    }

    setIsLoading(true);

    try {
      const normalizedUrl = trimmedUrl.startsWith("http")
        ? trimmedUrl
        : `https://${trimmedUrl}`;

      const response = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      if (!response.ok) {
        throw new Error("분석 요청에 실패했습니다.");
      }

      const data = await response.json();
      router.push(`/analysis/${data.id}/progress`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  const isLarge = size === "large";

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className={`flex ${isLarge ? "flex-col sm:flex-row" : "flex-row"} gap-3`}>
        <div className="flex-1">
          <Input
            type="text"
            placeholder="분석할 웹사이트 URL을 입력하세요"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError("");
            }}
            className={isLarge ? "h-14 text-lg px-5" : ""}
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={isLarge ? "h-14 px-8 text-lg" : ""}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              분석 중...
            </span>
          ) : (
            "분석 시작"
          )}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </form>
  );
}
