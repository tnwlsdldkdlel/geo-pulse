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
  seoResult: Record<string, unknown> | null;
  geoResult: Record<string, unknown> | null;
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
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-muted/30"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            strokeDasharray={`${(percentage / 100) * 352} 352`}
            className={getColor(percentage)}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute text-3xl font-bold ${getColor(percentage)}`}>
          {percentage}
        </span>
      </div>
      <p className="mt-2 font-medium">{label}</p>
    </div>
  );
}

function ResultCard({
  title,
  items,
  type,
}: {
  title: string;
  items: { label: string; value: string; status: "good" | "warning" | "bad" }[];
  type: "seo" | "geo";
}) {
  const borderColor = type === "seo" ? "border-blue-500/50" : "border-violet-500/50";
  const badgeColor = type === "seo" ? "bg-blue-100 text-blue-800" : "bg-violet-100 text-violet-800";

  return (
    <Card className={`border-2 hover:${borderColor} transition-colors`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge className={badgeColor}>{type.toUpperCase()}</Badge>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={index} className="flex items-center justify-between">
              <span className="text-muted-foreground">{item.label}</span>
              <span
                className={`font-medium ${
                  item.status === "good"
                    ? "text-green-600"
                    : item.status === "warning"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {item.value}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function AnalysisResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`/api/analysis/${id}`);
        if (!response.ok) {
          throw new Error("분석 결과를 불러올 수 없습니다.");
        }
        const data = await response.json();
        setAnalysis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">오류 발생</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link href="/">
              <Button>홈으로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (analysis.status !== "COMPLETED") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">분석 진행 중</h2>
            <p className="text-muted-foreground mb-6">
              분석이 아직 완료되지 않았습니다.
            </p>
            <Link href={`/analysis/${id}/progress`}>
              <Button>진행 상태 확인</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 임시 데이터 (실제로는 analysis.seoResult, geoResult에서 가져옴)
  const seoItems = [
    { label: "Title 태그", value: "양호", status: "good" as const },
    { label: "Meta Description", value: "개선 필요", status: "warning" as const },
    { label: "H1 태그", value: "양호", status: "good" as const },
    { label: "스키마 마크업", value: "누락", status: "bad" as const },
  ];

  const geoItems = [
    { label: "인용 신뢰도", value: "높음", status: "good" as const },
    { label: "LLM 가독성", value: "보통", status: "warning" as const },
    { label: "엔티티 최적화", value: "양호", status: "good" as const },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
            >
              ← 홈으로
            </Link>
            <h1 className="text-2xl font-bold">분석 결과</h1>
            <p className="text-muted-foreground truncate max-w-lg">
              {analysis.url}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">공유하기</Button>
            <Button variant="outline">PDF 다운로드</Button>
          </div>
        </div>

        {/* Score Overview */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ScoreGauge
                score={analysis.totalScore || 0}
                label="종합 점수"
              />
              <ScoreGauge score={analysis.seoScore || 0} label="SEO 점수" />
              <ScoreGauge score={analysis.geoScore || 0} label="GEO 점수" />
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ResultCard title="SEO 분석 결과" items={seoItems} type="seo" />
          <ResultCard title="GEO 분석 결과" items={geoItems} type="geo" />
        </div>

        {/* Action Guide */}
        <Card>
          <CardHeader>
            <CardTitle>개선 가이드</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  Meta Description 개선
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  현재 Meta Description이 너무 짧습니다. 150~160자 사이로
                  핵심 키워드를 포함하여 작성하세요.
                </p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  스키마 마크업 추가
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  구조화된 데이터(JSON-LD)가 없습니다. Organization 또는
                  WebPage 스키마를 추가하여 검색 엔진 이해도를 높이세요.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Analysis Button */}
        <div className="mt-8 text-center">
          <Link href="/">
            <Button size="lg">새로운 분석 시작</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
