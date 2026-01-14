"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Analysis {
  id: string;
  url: string;
  status: string;
  seoScore: number | null;
  geoScore: number | null;
  totalScore: number | null;
  createdAt: string;
}

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const percentage = Math.round(score);
  const getColor = (s: number) => {
    if (s >= 80) return "text-green-600";
    if (s >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="text-center">
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted/30"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${(percentage / 100) * 251} 251`}
            className={getColor(percentage)}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute text-2xl font-bold ${getColor(percentage)}`}>
          {percentage}
        </span>
      </div>
      <p className="mt-2 text-sm font-medium">{label}</p>
    </div>
  );
}

export default function SharedReportPage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = use(params);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/report/${shareToken}`);
        if (!response.ok) {
          throw new Error("리포트를 찾을 수 없습니다.");
        }
        const data = await response.json();
        setAnalysis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !analysis) {
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
            <h2 className="text-xl font-semibold mb-2">리포트를 찾을 수 없습니다</h2>
            <p className="text-muted-foreground mb-6">
              링크가 만료되었거나 잘못된 링크입니다.
            </p>
            <Link href="/">
              <Button>GEO-Pulse 시작하기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="font-bold text-xl">GEO-Pulse</span>
            </div>
          </Link>
          <Link href="/">
            <Button>내 사이트 분석하기</Button>
          </Link>
        </div>
      </header>

      <main className="container py-8">
        {/* Report Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            공유된 리포트
          </Badge>
          <h1 className="text-2xl font-bold mb-2">SEO/GEO 분석 결과</h1>
          <p className="text-muted-foreground truncate max-w-lg mx-auto">
            {analysis.url}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            분석일: {new Date(analysis.createdAt).toLocaleDateString("ko-KR")}
          </p>
        </div>

        {/* Score Overview */}
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-center">분석 점수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <ScoreGauge score={analysis.totalScore || 0} label="종합" />
              <ScoreGauge score={analysis.seoScore || 0} label="SEO" />
              <ScoreGauge score={analysis.geoScore || 0} label="GEO" />
            </div>
          </CardContent>
        </Card>

        {/* Score Explanation */}
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle>점수 해석</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-sm">S</span>
              </div>
              <div>
                <h4 className="font-medium">SEO 점수</h4>
                <p className="text-sm text-muted-foreground">
                  전통적인 검색 엔진 최적화 상태입니다. Meta 태그, 헤더 구조,
                  스키마 마크업 등을 평가합니다.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-violet-600 font-bold text-sm">G</span>
              </div>
              <div>
                <h4 className="font-medium">GEO 점수</h4>
                <p className="text-sm text-muted-foreground">
                  AI 검색 엔진 최적화 상태입니다. ChatGPT, Perplexity 등 AI가
                  콘텐츠를 인용할 가능성을 평가합니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">
            내 웹사이트도 분석해보세요
          </h3>
          <p className="text-muted-foreground mb-4">
            무료로 SEO/GEO 점수를 확인하고 개선 가이드를 받아보세요.
          </p>
          <Link href="/">
            <Button size="lg">무료로 분석 시작하기</Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} GEO-Pulse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
