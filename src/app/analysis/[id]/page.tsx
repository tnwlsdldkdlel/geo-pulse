"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SEOResult {
  score: number;
  meta: {
    score: number;
    title: { value: string | null; length: number; status: string; message: string };
    description: { value: string | null; length: number; status: string; message: string };
    keywords: { value: string | null; status: string; message: string };
    ogTags: { hasTitle: boolean; hasDescription: boolean; hasImage: boolean; status: string; message: string };
    canonical: { value: string | null; status: string; message: string };
  };
  headers: { score: number; h1Count: number; status: string; message: string };
  schema: { score: number; hasSchema: boolean; types: string[]; status: string; message: string };
  performance: { score: number; loadTime: number; pageSize: number; status: string; message: string };
}

interface GEOResult {
  score: number;
  citationReliability: {
    score: number;
    hasStatistics: boolean;
    hasSources: boolean;
    eeatScore: number;
    status: string;
    message: string;
    details: string;
  };
  llmReadability: {
    score: number;
    isAnswerReady: boolean;
    status: string;
    message: string;
    summary: string;
  };
  structuralOptimization: {
    score: number;
    listUtilization: number;
    tableUtilization: number;
    hierarchyScore: number;
    snippetPotential: "High" | "Medium" | "Low";
    status: string;
    message: string;
  };
  entityOptimization: {
    score: number;
    entities: string[];
    status: string;
    message: string;
  };
  actionableInsights: {
    forMarketer: string;
    forDeveloper: string;
  };
}

interface Analysis {
  id: string;
  url: string;
  status: string;
  seoScore: number | null;
  geoScore: number | null;
  totalScore: number | null;
  seoResult: SEOResult | null;
  geoResult: GEOResult | null;
  createdAt: string;
}

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const percentage = Math.round(score);
  const getColor = (s: number) => {
    if (s >= 70) return "text-green-600";
    if (s >= 40) return "text-yellow-600";
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

function StatusBadge({ status }: { status: string }) {
  const colors = {
    good: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    bad: "bg-red-100 text-red-800",
  };
  const labels = {
    good: "양호",
    warning: "개선 필요",
    bad: "미흡",
  };
  return (
    <Badge className={colors[status as keyof typeof colors] || colors.warning}>
      {labels[status as keyof typeof labels] || status}
    </Badge>
  );
}

function SnippetBadge({ potential }: { potential: "High" | "Medium" | "Low" }) {
  const colors = {
    High: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-red-100 text-red-800",
  };
  const labels = {
    High: "높음",
    Medium: "보통",
    Low: "낮음",
  };
  return (
    <Badge className={colors[potential]}>
      {labels[potential]}
    </Badge>
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

  const seoResult = analysis.seoResult;
  const geoResult = analysis.geoResult;

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

        {/* SEO Results */}
        {seoResult && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">SEO</Badge>
                SEO 분석 결과
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Title 태그 */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Title 태그</span>
                    <StatusBadge status={seoResult.meta.title.status} />
                  </div>
                  {seoResult.meta.title.value && (
                    <p className="text-sm text-muted-foreground mb-2 break-all">
                      현재 값: &quot;{seoResult.meta.title.value}&quot;
                    </p>
                  )}
                  <p className={`text-sm ${seoResult.meta.title.status === 'good' ? 'text-green-600' : seoResult.meta.title.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                    {seoResult.meta.title.message}
                  </p>
                </div>

                {/* Meta Description */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Meta Description</span>
                    <StatusBadge status={seoResult.meta.description.status} />
                  </div>
                  {seoResult.meta.description.value && (
                    <p className="text-sm text-muted-foreground mb-2 break-all">
                      현재 값: &quot;{seoResult.meta.description.value.length > 100
                        ? seoResult.meta.description.value.substring(0, 100) + '...'
                        : seoResult.meta.description.value}&quot;
                    </p>
                  )}
                  <p className={`text-sm ${seoResult.meta.description.status === 'good' ? 'text-green-600' : seoResult.meta.description.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                    {seoResult.meta.description.message}
                  </p>
                </div>

                {/* OG 태그 */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">OG 태그 (소셜 미디어 공유)</span>
                    <StatusBadge status={seoResult.meta.ogTags.status} />
                  </div>
                  <div className="text-sm text-muted-foreground mb-2 space-y-1">
                    <p>og:title: {seoResult.meta.ogTags.hasTitle ? '✓ 있음' : '✗ 없음'}</p>
                    <p>og:description: {seoResult.meta.ogTags.hasDescription ? '✓ 있음' : '✗ 없음'}</p>
                    <p>og:image: {seoResult.meta.ogTags.hasImage ? '✓ 있음' : '✗ 없음'}</p>
                  </div>
                  <p className={`text-sm ${seoResult.meta.ogTags.status === 'good' ? 'text-green-600' : seoResult.meta.ogTags.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                    {seoResult.meta.ogTags.message}
                  </p>
                </div>

                {/* Canonical URL */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Canonical URL</span>
                    <StatusBadge status={seoResult.meta.canonical.status} />
                  </div>
                  {seoResult.meta.canonical.value && (
                    <p className="text-sm text-muted-foreground mb-2 break-all">
                      현재 값: {seoResult.meta.canonical.value}
                    </p>
                  )}
                  <p className={`text-sm ${seoResult.meta.canonical.status === 'good' ? 'text-green-600' : seoResult.meta.canonical.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                    {seoResult.meta.canonical.message}
                  </p>
                </div>

                {/* H1 태그 */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">H1 태그</span>
                    <StatusBadge status={seoResult.headers.status} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    현재 개수: {seoResult.headers.h1Count}개 (권장: 1개)
                  </p>
                  <p className={`text-sm ${seoResult.headers.status === 'good' ? 'text-green-600' : seoResult.headers.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                    {seoResult.headers.message}
                  </p>
                </div>

                {/* 스키마 마크업 */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">스키마 마크업 (JSON-LD)</span>
                    <StatusBadge status={seoResult.schema.status} />
                  </div>
                  {seoResult.schema.hasSchema && seoResult.schema.types.length > 0 && (
                    <p className="text-sm text-muted-foreground mb-2">
                      감지된 스키마: {seoResult.schema.types.join(', ')}
                    </p>
                  )}
                  <p className={`text-sm ${seoResult.schema.status === 'good' ? 'text-green-600' : seoResult.schema.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                    {seoResult.schema.message}
                  </p>
                </div>

                {/* 페이지 성능 */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">페이지 성능</span>
                    <StatusBadge status={seoResult.performance.status} />
                  </div>
                  <div className="text-sm text-muted-foreground mb-2 space-y-1">
                    <p>로딩 시간: {(seoResult.performance.loadTime / 1000).toFixed(1)}초 (권장: 2초 미만)</p>
                    <p>페이지 크기: {(seoResult.performance.pageSize / 1024).toFixed(0)}KB (권장: 500KB 미만)</p>
                  </div>
                  <p className={`text-sm ${seoResult.performance.status === 'good' ? 'text-green-600' : seoResult.performance.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                    {seoResult.performance.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* GEO Results */}
        {geoResult && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-violet-100 text-violet-800">GEO</Badge>
                GEO 분석 결과
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {/* 인용 신뢰도 */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">인용 신뢰도</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{geoResult.citationReliability.score}점</span>
                      <StatusBadge status={geoResult.citationReliability.status} />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2 space-y-1">
                    <p>E-E-A-T 점수: {geoResult.citationReliability.eeatScore}점 (권장: 70점 이상)</p>
                    <p>통계 데이터: {geoResult.citationReliability.hasStatistics ? '✓ 포함됨' : '✗ 없음 - 수치나 통계를 추가하면 AI 인용 가능성이 높아집니다'}</p>
                    <p>출처 언급: {geoResult.citationReliability.hasSources ? '✓ 있음' : '✗ 없음 - 신뢰할 수 있는 출처를 명시하세요'}</p>
                  </div>
                  <p className={`text-sm ${geoResult.citationReliability.status === 'good' ? 'text-green-600' : geoResult.citationReliability.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                    {geoResult.citationReliability.message}
                  </p>
                </div>

                {/* LLM 가독성 */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">LLM 가독성</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{geoResult.llmReadability.score}점</span>
                      <StatusBadge status={geoResult.llmReadability.status} />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    <p>
                      즉시 답변 가능 여부:{" "}
                      {geoResult.llmReadability.isAnswerReady ? (
                        <span className="text-green-600 font-medium">✓ 예 - AI가 이 콘텐츠로 바로 답변할 수 있습니다</span>
                      ) : (
                        <span className="text-red-600 font-medium">✗ 아니오 - 핵심 정보를 명확하게 구조화하세요</span>
                      )}
                    </p>
                  </div>
                  <p className={`text-sm ${geoResult.llmReadability.status === 'good' ? 'text-green-600' : geoResult.llmReadability.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                    {geoResult.llmReadability.message}
                  </p>
                </div>

                {/* 구조 최적화 */}
                {geoResult.structuralOptimization && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">구조 최적화</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{geoResult.structuralOptimization.score}점</span>
                        <StatusBadge status={geoResult.structuralOptimization.status} />
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2 space-y-1">
                      <p>리스트(불릿) 활용도: {geoResult.structuralOptimization.listUtilization}점 {geoResult.structuralOptimization.listUtilization < 50 && '- 핵심 내용을 리스트로 정리하면 AI가 더 쉽게 인용합니다'}</p>
                      <p>표(테이블) 활용도: {geoResult.structuralOptimization.tableUtilization}점 {geoResult.structuralOptimization.tableUtilization < 50 && '- 비교 데이터는 표로 정리하면 효과적입니다'}</p>
                      <p>헤더 계층 구조: {geoResult.structuralOptimization.hierarchyScore}점 {geoResult.structuralOptimization.hierarchyScore < 50 && '- H1 → H2 → H3 순서로 논리적 계층을 만드세요'}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span>AI 스니펫 채택 가능성:</span>
                        <SnippetBadge potential={geoResult.structuralOptimization.snippetPotential} />
                        {geoResult.structuralOptimization.snippetPotential === 'Low' && (
                          <span className="text-red-600 ml-2">- 구조화된 콘텐츠가 필요합니다</span>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm ${geoResult.structuralOptimization.status === 'good' ? 'text-green-600' : geoResult.structuralOptimization.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                      {geoResult.structuralOptimization.message}
                    </p>
                  </div>
                )}

                {/* 엔티티 최적화 */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">엔티티 최적화</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{geoResult.entityOptimization.score}점</span>
                      <StatusBadge status={geoResult.entityOptimization.status} />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    <p className="mb-2">감지된 주요 엔티티 (브랜드, 제품, 주제):</p>
                    {geoResult.entityOptimization.entities.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {geoResult.entityOptimization.entities.slice(0, 8).map((entity, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {entity}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-red-600">엔티티가 감지되지 않았습니다. 브랜드명과 핵심 키워드를 명확하게 언급하세요.</p>
                    )}
                  </div>
                  <p className={`text-sm ${geoResult.entityOptimization.status === 'good' ? 'text-green-600' : geoResult.entityOptimization.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                    {geoResult.entityOptimization.message}
                  </p>
                </div>
              </div>

              {/* AI 요약 */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  AI 콘텐츠 요약
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {geoResult.llmReadability.summary}
                </p>
              </div>

              {/* E-E-A-T 분석 */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                  인용 신뢰도 상세 분석
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {geoResult.citationReliability.details}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actionable Insights */}
        {geoResult?.actionableInsights && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>개선 가이드</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                    마케터를 위한 개선점
                  </h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    {geoResult.actionableInsights.forMarketer}
                  </p>
                </div>
                <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                  <h4 className="font-semibold text-cyan-800 dark:text-cyan-200 mb-2">
                    개발자를 위한 개선점
                  </h4>
                  <p className="text-sm text-cyan-700 dark:text-cyan-300">
                    {geoResult.actionableInsights.forDeveloper}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
