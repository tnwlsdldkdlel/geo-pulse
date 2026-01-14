"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AnalysisStatus {
  id: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  url: string;
  seoScore: number | null;
  geoScore: number | null;
  totalScore: number | null;
}

const stages = [
  { key: "crawling", label: "웹페이지 크롤링", description: "페이지 데이터 수집 중..." },
  { key: "seo", label: "SEO 분석", description: "Meta 태그, 헤더 구조 분석 중..." },
  { key: "geo", label: "GEO 분석", description: "AI 검색 최적화 분석 중..." },
  { key: "complete", label: "완료", description: "분석이 완료되었습니다!" },
];

export default function AnalysisProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [status, setStatus] = useState<AnalysisStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/analysis/${id}/status`);
        if (!response.ok) {
          throw new Error("분석 상태를 불러올 수 없습니다.");
        }
        const data: AnalysisStatus = await response.json();
        setStatus(data);

        // 상태에 따른 스테이지 업데이트
        if (data.status === "PENDING") {
          setCurrentStage(0);
        } else if (data.status === "PROCESSING") {
          // 진행 중일 때는 1-2 사이를 순환
          setCurrentStage((prev) => (prev < 2 ? prev + 1 : 1));
        } else if (data.status === "COMPLETED") {
          setCurrentStage(3);
          // 완료되면 결과 페이지로 이동
          setTimeout(() => {
            router.push(`/analysis/${id}`);
          }, 1500);
        } else if (data.status === "FAILED") {
          setError("분석 중 오류가 발생했습니다.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      }
    };

    // 초기 로드
    fetchStatus();

    // 폴링 (2초마다)
    const interval = setInterval(fetchStatus, 2000);

    return () => clearInterval(interval);
  }, [id, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">분석 실패</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link href="/">
              <Button>다시 시도하기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
      <Card className="max-w-lg w-full mx-4">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">분석 진행 중</h1>
            {status && (
              <p className="text-sm text-muted-foreground truncate max-w-md mx-auto">
                {status.url}
              </p>
            )}
          </div>

          {/* Progress Steps */}
          <div className="space-y-4">
            {stages.map((stage, index) => (
              <div
                key={stage.key}
                className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                  index === currentStage
                    ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                    : index < currentStage
                    ? "bg-green-50 dark:bg-green-900/20"
                    : "bg-muted/50"
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    index < currentStage
                      ? "bg-green-600 text-white"
                      : index === currentStage
                      ? "bg-blue-600 text-white"
                      : "bg-muted-foreground/20 text-muted-foreground"
                  }`}
                >
                  {index < currentStage ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : index === currentStage ? (
                    <svg
                      className="h-5 w-5 animate-spin"
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
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{stage.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {stage.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              분석에는 약 30초~1분 정도 소요됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
