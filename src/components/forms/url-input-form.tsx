"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UrlInputFormProps {
  size?: "default" | "large";
  className?: string;
}

interface ProgressMessage {
  type: "progress" | "complete" | "error";
  stage?: string;
  progress?: number;
  message?: string;
  data?: AnalysisResult;
  error?: string;
}

interface AnalysisResult {
  id: string;
  url: string;
  status: string;
  seoScore: number;
  geoScore: number;
  totalScore: number;
  seoResult: unknown;
  geoResult: unknown;
  createdAt: string;
}

const stageLabels: Record<string, string> = {
  crawling: "웹페이지 크롤링",
  seo: "SEO 분석",
  geo: "GEO 분석",
};

export function UrlInputForm({ size = "default", className }: UrlInputFormProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState("");
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
    setProgress(0);
    setCurrentStage("");

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
        const errorData = await response.json();
        throw new Error(errorData.error || "분석 요청에 실패했습니다.");
      }

      // SSE 스트리밍 응답 처리
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("응답을 읽을 수 없습니다.");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const message: ProgressMessage = JSON.parse(line.slice(6));

              if (message.type === "progress") {
                setProgress(message.progress || 0);
                setCurrentStage(message.stage || "");
              } else if (message.type === "complete" && message.data) {
                // LocalStorage에 결과 저장
                localStorage.setItem(
                  `analysis_${message.data.id}`,
                  JSON.stringify(message.data)
                );
                // 결과 페이지로 이동
                router.push(`/analysis/${message.data.id}`);
                return;
              } else if (message.type === "error") {
                throw new Error(message.error || "분석 중 오류가 발생했습니다.");
              }
            } catch (parseError) {
              // JSON 파싱 실패 무시 (불완전한 데이터)
              if (parseError instanceof SyntaxError) continue;
              throw parseError;
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setIsLoading(false);
      setProgress(0);
      setCurrentStage("");
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

      {/* 진행 상태 표시 */}
      {isLoading && progress > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">
              {currentStage ? stageLabels[currentStage] || currentStage : "처리 중..."}
            </span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </form>
  );
}
