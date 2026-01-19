"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// 코드 복사 컴포넌트
function CodeBlock({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3">
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      <div className="relative">
        <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg text-sm overflow-x-auto">
          <code>{code}</code>
        </pre>
        <Button
          size="sm"
          variant="secondary"
          className="absolute top-2 right-2 h-7 text-xs"
          onClick={handleCopy}
        >
          {copied ? "복사완료!" : "복사"}
        </Button>
      </div>
    </div>
  );
}

// 공유 버튼 컴포넌트
function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 API 지원하지 않는 경우 무시
    }
  };

  return (
    <Button variant="outline" onClick={handleShare}>
      {copied ? "복사완료!" : "링크 복사"}
    </Button>
  );
}

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
    // LocalStorage에서 분석 결과 로드
    const loadAnalysis = () => {
      try {
        const stored = localStorage.getItem(`analysis_${id}`);
        if (stored) {
          const data = JSON.parse(stored);
          setAnalysis(data);
        } else {
          setError("분석 결과를 찾을 수 없습니다. 새로운 분석을 시작해주세요.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
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
            <ShareButton />
          </div>
        </div>

        {/* Site Summary */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* 사이트 아이콘 및 기본 정보 */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${new URL(analysis.url).hostname}&sz=64`}
                    alt="favicon"
                    className="w-10 h-10"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold mb-1 truncate">
                    {seoResult?.meta.title.value || new URL(analysis.url).hostname}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-2">
                    {new URL(analysis.url).hostname}
                  </p>
                  {seoResult?.schema.types && seoResult.schema.types.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {seoResult.schema.types.map((type, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 주요 엔티티/키워드 */}
              {geoResult?.entityOptimization.entities && geoResult.entityOptimization.entities.length > 0 && (
                <div className="md:w-64 flex-shrink-0">
                  <p className="text-sm font-medium text-muted-foreground mb-2">주요 키워드</p>
                  <div className="flex flex-wrap gap-1">
                    {geoResult.entityOptimization.entities.slice(0, 6).map((entity, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {entity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 사이트 설명 */}
            {seoResult?.meta.description.value && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {seoResult.meta.description.value}
                </p>
              </div>
            )}

            {/* AI 요약 */}
            {geoResult?.llmReadability.summary && (
              <div className="mt-4 p-4 bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 rounded-lg">
                <p className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-1">AI 분석 요약</p>
                <p className="text-sm">
                  {geoResult.llmReadability.summary}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

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

        {/* Analysis Results Tabs */}
        {(seoResult || geoResult) && (
          <Tabs defaultValue="seo" className="mb-8">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="seo" className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                SEO 분석
                {seoResult && (
                  <Badge variant="secondary" className="ml-1">
                    {analysis.seoScore}점
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="geo" className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                GEO 분석
                {geoResult && (
                  <Badge variant="secondary" className="ml-1">
                    {analysis.geoScore}점
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* SEO Tab Content */}
            <TabsContent value="seo">
              {seoResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">SEO</Badge>
                      SEO 분석 결과
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="multiple" className="space-y-2">
                      {/* Title 태그 */}
                      <AccordionItem value="title" className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-medium">Title 태그</span>
                            <StatusBadge status={seoResult.meta.title.status} />
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-2 space-y-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">현재 값</p>
                              <p className="text-sm bg-muted/50 p-2 rounded break-all">
                                {seoResult.meta.title.value || "(없음)"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                길이: {seoResult.meta.title.length}자 (권장: 30~60자)
                              </p>
                            </div>
                            <p className={`text-sm ${seoResult.meta.title.status === 'good' ? 'text-green-600' : seoResult.meta.title.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                              {seoResult.meta.title.message}
                            </p>
                            {seoResult.meta.title.status !== 'good' && (
                              <CodeBlock
                                label="권장 코드"
                                code={`<title>핵심 키워드를 포함한 제목 (30~60자)</title>`}
                              />
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Meta Description */}
                      <AccordionItem value="description" className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-medium">Meta Description</span>
                            <StatusBadge status={seoResult.meta.description.status} />
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-2 space-y-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">현재 값</p>
                              <p className="text-sm bg-muted/50 p-2 rounded break-all">
                                {seoResult.meta.description.value || "(없음)"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                길이: {seoResult.meta.description.length}자 (권장: 70~160자)
                              </p>
                            </div>
                            <p className={`text-sm ${seoResult.meta.description.status === 'good' ? 'text-green-600' : seoResult.meta.description.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                              {seoResult.meta.description.message}
                            </p>
                            {seoResult.meta.description.status !== 'good' && (
                              <CodeBlock
                                label="권장 코드"
                                code={`<meta name="description" content="페이지 내용을 요약하는 설명문 (70~160자)" />`}
                              />
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* OG 태그 */}
                      <AccordionItem value="og" className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-medium">OG 태그 (소셜 미디어)</span>
                            <StatusBadge status={seoResult.meta.ogTags.status} />
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-2 space-y-3">
                            <div className="text-sm space-y-1">
                              <p>og:title: {seoResult.meta.ogTags.hasTitle ? <span className="text-green-600">✓ 있음</span> : <span className="text-red-600">✗ 없음</span>}</p>
                              <p>og:description: {seoResult.meta.ogTags.hasDescription ? <span className="text-green-600">✓ 있음</span> : <span className="text-red-600">✗ 없음</span>}</p>
                              <p>og:image: {seoResult.meta.ogTags.hasImage ? <span className="text-green-600">✓ 있음</span> : <span className="text-red-600">✗ 없음</span>}</p>
                            </div>
                            <p className={`text-sm ${seoResult.meta.ogTags.status === 'good' ? 'text-green-600' : seoResult.meta.ogTags.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                              {seoResult.meta.ogTags.message}
                            </p>
                            {seoResult.meta.ogTags.status !== 'good' && (
                              <CodeBlock
                                label="권장 코드"
                                code={`<meta property="og:title" content="페이지 제목" />
<meta property="og:description" content="페이지 설명" />
<meta property="og:image" content="https://example.com/image.jpg" />
<meta property="og:url" content="${analysis.url}" />`}
                              />
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Canonical URL */}
                      <AccordionItem value="canonical" className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-medium">Canonical URL</span>
                            <StatusBadge status={seoResult.meta.canonical.status} />
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-2 space-y-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">현재 값</p>
                              <p className="text-sm bg-muted/50 p-2 rounded break-all">
                                {seoResult.meta.canonical.value || "(없음)"}
                              </p>
                            </div>
                            <p className={`text-sm ${seoResult.meta.canonical.status === 'good' ? 'text-green-600' : seoResult.meta.canonical.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                              {seoResult.meta.canonical.message}
                            </p>
                            {seoResult.meta.canonical.status !== 'good' && (
                              <CodeBlock
                                label="권장 코드"
                                code={`<link rel="canonical" href="${analysis.url}" />`}
                              />
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* H1 태그 */}
                      <AccordionItem value="h1" className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-medium">H1 태그</span>
                            <StatusBadge status={seoResult.headers.status} />
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-2 space-y-3">
                            <p className="text-sm">
                              현재 개수: <span className="font-medium">{seoResult.headers.h1Count}개</span> (권장: 1개)
                            </p>
                            <p className={`text-sm ${seoResult.headers.status === 'good' ? 'text-green-600' : seoResult.headers.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                              {seoResult.headers.message}
                            </p>
                            {seoResult.headers.status !== 'good' && (
                              <CodeBlock
                                label="권장 구조"
                                code={`<h1>페이지의 주요 제목 (1개만)</h1>
<h2>섹션 제목</h2>
<h3>하위 섹션 제목</h3>`}
                              />
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* 스키마 마크업 */}
                      <AccordionItem value="schema" className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-medium">스키마 마크업 (JSON-LD)</span>
                            <StatusBadge status={seoResult.schema.status} />
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-2 space-y-3">
                            {seoResult.schema.hasSchema && seoResult.schema.types.length > 0 ? (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">감지된 스키마</p>
                                <div className="flex flex-wrap gap-1">
                                  {seoResult.schema.types.map((type, i) => (
                                    <Badge key={i} variant="secondary">{type}</Badge>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">스키마 마크업이 감지되지 않았습니다.</p>
                            )}
                            <p className={`text-sm ${seoResult.schema.status === 'good' ? 'text-green-600' : seoResult.schema.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                              {seoResult.schema.message}
                            </p>
                            {seoResult.schema.status !== 'good' && (
                              <CodeBlock
                                label="권장 코드 (Organization 예시)"
                                code={`<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "회사명",
  "url": "${analysis.url}",
  "logo": "https://example.com/logo.png"
}
</script>`}
                              />
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* 페이지 성능 */}
                      <AccordionItem value="performance" className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-medium">페이지 성능</span>
                            <StatusBadge status={seoResult.performance.status} />
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-2 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-muted/50 p-3 rounded">
                                <p className="text-xs text-muted-foreground">로딩 시간</p>
                                <p className="text-lg font-bold">{(seoResult.performance.loadTime / 1000).toFixed(1)}초</p>
                                <p className="text-xs text-muted-foreground">권장: 2초 미만</p>
                              </div>
                              <div className="bg-muted/50 p-3 rounded">
                                <p className="text-xs text-muted-foreground">페이지 크기</p>
                                <p className="text-lg font-bold">{(seoResult.performance.pageSize / 1024).toFixed(0)}KB</p>
                                <p className="text-xs text-muted-foreground">권장: 500KB 미만</p>
                              </div>
                            </div>
                            <p className={`text-sm ${seoResult.performance.status === 'good' ? 'text-green-600' : seoResult.performance.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                              {seoResult.performance.message}
                            </p>
                            {seoResult.performance.status !== 'good' && (
                              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                                <p className="font-medium mb-2">성능 개선 팁:</p>
                                <ul className="list-disc list-inside space-y-1">
                                  <li>이미지 최적화 (WebP 포맷, 압축)</li>
                                  <li>CSS/JS 파일 압축 및 번들링</li>
                                  <li>CDN 사용</li>
                                  <li>브라우저 캐싱 설정</li>
                                </ul>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* GEO Tab Content */}
            <TabsContent value="geo">
              {geoResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge className="bg-violet-100 text-violet-800">GEO</Badge>
                      GEO 분석 결과
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="multiple" className="space-y-2">
                      {/* 인용 신뢰도 */}
                      <AccordionItem value="citation" className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-medium">인용 신뢰도</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold">{geoResult.citationReliability.score}점</span>
                              <StatusBadge status={geoResult.citationReliability.status} />
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-2 space-y-3">
                            <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">E-E-A-T 점수</span>
                                <span className={`font-medium ${geoResult.citationReliability.eeatScore >= 70 ? 'text-green-600' : geoResult.citationReliability.eeatScore >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {geoResult.citationReliability.eeatScore}점 / 100점
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">권장: 70점 이상</p>
                            </div>
                            <div className="text-sm space-y-2">
                              <p>
                                통계 데이터: {geoResult.citationReliability.hasStatistics ? (
                                  <span className="text-green-600">✓ 포함됨</span>
                                ) : (
                                  <span className="text-red-600">✗ 없음</span>
                                )}
                              </p>
                              <p>
                                출처 언급: {geoResult.citationReliability.hasSources ? (
                                  <span className="text-green-600">✓ 있음</span>
                                ) : (
                                  <span className="text-red-600">✗ 없음</span>
                                )}
                              </p>
                            </div>
                            <p className={`text-sm ${geoResult.citationReliability.status === 'good' ? 'text-green-600' : geoResult.citationReliability.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                              {geoResult.citationReliability.message}
                            </p>
                            {geoResult.citationReliability.status !== 'good' && (
                              <>
                                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                                  <p className="font-medium mb-2">개선 방법:</p>
                                  <ul className="list-disc list-inside space-y-1">
                                    {!geoResult.citationReliability.hasStatistics && (
                                      <li>구체적인 수치나 통계 데이터를 추가하세요 (예: "30% 증가", "100만 사용자")</li>
                                    )}
                                    {!geoResult.citationReliability.hasSources && (
                                      <li>신뢰할 수 있는 출처를 명시하세요 (예: "~에 따르면", "~ 연구 결과")</li>
                                    )}
                                    <li>작성자 정보와 전문성을 명확히 표시하세요</li>
                                    <li>최신 정보로 업데이트하고 날짜를 표시하세요</li>
                                  </ul>
                                </div>
                                <CodeBlock
                                  label="권장 구조 (E-E-A-T 향상)"
                                  code={`<!-- 작성자 정보 추가 -->
<div class="author-info">
  <span>작성자: 홍길동 (10년 경력 전문가)</span>
  <span>최종 업데이트: 2024년 1월</span>
</div>

<!-- 통계 및 출처 포함 예시 -->
<p>
  2024년 조사에 따르면 <strong>78%</strong>의 사용자가
  이 기능을 선호합니다. (출처: OOO 연구소)
</p>`}
                                />
                              </>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* LLM 가독성 */}
                      <AccordionItem value="readability" className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-medium">LLM 가독성</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold">{geoResult.llmReadability.score}점</span>
                              <StatusBadge status={geoResult.llmReadability.status} />
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-2 space-y-3">
                            <div className="bg-muted/50 p-3 rounded-lg">
                              <p className="text-sm">
                                즉시 답변 가능 여부:{" "}
                                {geoResult.llmReadability.isAnswerReady ? (
                                  <span className="text-green-600 font-medium">✓ 예</span>
                                ) : (
                                  <span className="text-red-600 font-medium">✗ 아니오</span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {geoResult.llmReadability.isAnswerReady
                                  ? "AI가 이 콘텐츠로 바로 답변할 수 있습니다"
                                  : "핵심 정보를 명확하게 구조화하면 AI가 더 쉽게 인용합니다"
                                }
                              </p>
                            </div>
                            <p className={`text-sm ${geoResult.llmReadability.status === 'good' ? 'text-green-600' : geoResult.llmReadability.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                              {geoResult.llmReadability.message}
                            </p>
                            {geoResult.llmReadability.status !== 'good' && (
                              <>
                                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                                  <p className="font-medium mb-2">개선 방법:</p>
                                  <ul className="list-disc list-inside space-y-1">
                                    <li>핵심 정보를 첫 문단에 배치하세요 (역피라미드 구조)</li>
                                    <li>복잡한 문장을 짧고 명확하게 나누세요</li>
                                    <li>전문 용어에는 간단한 설명을 추가하세요</li>
                                    <li>질문-답변 형식으로 콘텐츠를 구성하세요</li>
                                  </ul>
                                </div>
                                <CodeBlock
                                  label="권장 구조 (AI 친화적 콘텐츠)"
                                  code={`<!-- 핵심 정보 먼저 (Featured Snippet 최적화) -->
<h2>OOO이란?</h2>
<p>
  <strong>OOO</strong>은 XXX를 위한 YYY입니다.
  주요 특징은 다음과 같습니다:
</p>

<!-- 명확한 리스트 구조 -->
<ul>
  <li><strong>특징 1:</strong> 설명</li>
  <li><strong>특징 2:</strong> 설명</li>
  <li><strong>특징 3:</strong> 설명</li>
</ul>`}
                                />
                              </>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* 구조 최적화 */}
                      {geoResult.structuralOptimization && (
                        <AccordionItem value="structure" className="border rounded-lg px-4">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <span className="font-medium">구조 최적화</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold">{geoResult.structuralOptimization.score}점</span>
                                <StatusBadge status={geoResult.structuralOptimization.status} />
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pt-2 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-muted/50 p-3 rounded-lg">
                                  <p className="text-xs text-muted-foreground">리스트 활용도</p>
                                  <p className={`text-lg font-bold ${geoResult.structuralOptimization.listUtilization >= 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {geoResult.structuralOptimization.listUtilization}점
                                  </p>
                                </div>
                                <div className="bg-muted/50 p-3 rounded-lg">
                                  <p className="text-xs text-muted-foreground">테이블 활용도</p>
                                  <p className={`text-lg font-bold ${geoResult.structuralOptimization.tableUtilization >= 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {geoResult.structuralOptimization.tableUtilization}점
                                  </p>
                                </div>
                                <div className="bg-muted/50 p-3 rounded-lg">
                                  <p className="text-xs text-muted-foreground">헤더 계층 구조</p>
                                  <p className={`text-lg font-bold ${geoResult.structuralOptimization.hierarchyScore >= 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {geoResult.structuralOptimization.hierarchyScore}점
                                  </p>
                                </div>
                                <div className="bg-muted/50 p-3 rounded-lg">
                                  <p className="text-xs text-muted-foreground">스니펫 채택 가능성</p>
                                  <SnippetBadge potential={geoResult.structuralOptimization.snippetPotential} />
                                </div>
                              </div>
                              <p className={`text-sm ${geoResult.structuralOptimization.status === 'good' ? 'text-green-600' : geoResult.structuralOptimization.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                                {geoResult.structuralOptimization.message}
                              </p>
                              {geoResult.structuralOptimization.status !== 'good' && (
                                <>
                                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                                    <p className="font-medium mb-2">개선 방법:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                      {geoResult.structuralOptimization.listUtilization < 50 && (
                                        <li>핵심 내용을 불릿 리스트나 번호 목록으로 정리하세요</li>
                                      )}
                                      {geoResult.structuralOptimization.tableUtilization < 50 && (
                                        <li>비교 데이터나 스펙은 표(테이블)로 정리하세요</li>
                                      )}
                                      {geoResult.structuralOptimization.hierarchyScore < 50 && (
                                        <li>H1 → H2 → H3 순서로 논리적 계층을 구성하세요</li>
                                      )}
                                    </ul>
                                  </div>
                                  <CodeBlock
                                    label="권장 구조 (AI 스니펫 최적화)"
                                    code={`<!-- 명확한 헤더 계층 -->
<h1>메인 주제</h1>

<h2>섹션 1: 핵심 포인트</h2>
<ul>
  <li>포인트 1</li>
  <li>포인트 2</li>
  <li>포인트 3</li>
</ul>

<h2>섹션 2: 비교 분석</h2>
<table>
  <thead>
    <tr><th>항목</th><th>옵션 A</th><th>옵션 B</th></tr>
  </thead>
  <tbody>
    <tr><td>가격</td><td>10,000원</td><td>15,000원</td></tr>
    <tr><td>기능</td><td>기본</td><td>프리미엄</td></tr>
  </tbody>
</table>`}
                                  />
                                </>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}

                      {/* 엔티티 최적화 */}
                      <AccordionItem value="entity" className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-medium">엔티티 최적화</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold">{geoResult.entityOptimization.score}점</span>
                              <StatusBadge status={geoResult.entityOptimization.status} />
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-2 space-y-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">감지된 주요 엔티티</p>
                              {geoResult.entityOptimization.entities.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {geoResult.entityOptimization.entities.slice(0, 10).map((entity, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {entity}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-red-600">엔티티가 감지되지 않았습니다.</p>
                              )}
                            </div>
                            <p className={`text-sm ${geoResult.entityOptimization.status === 'good' ? 'text-green-600' : geoResult.entityOptimization.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                              {geoResult.entityOptimization.message}
                            </p>
                            {geoResult.entityOptimization.status !== 'good' && (
                              <>
                                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                                  <p className="font-medium mb-2">개선 방법:</p>
                                  <ul className="list-disc list-inside space-y-1">
                                    <li>브랜드명을 페이지 내에서 일관되게 사용하세요</li>
                                    <li>제품/서비스명을 명확하게 언급하세요</li>
                                    <li>관련 카테고리 키워드를 자연스럽게 포함하세요</li>
                                    <li>Schema.org 마크업으로 엔티티를 명시하세요</li>
                                  </ul>
                                </div>
                                <CodeBlock
                                  label="권장 코드 (엔티티 마크업)"
                                  code={`<!-- Organization Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "브랜드명",
  "alternateName": "별칭",
  "url": "${analysis.url}",
  "sameAs": [
    "https://facebook.com/브랜드",
    "https://twitter.com/브랜드"
  ]
}
</script>

<!-- Product Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "제품명",
  "brand": {
    "@type": "Brand",
    "name": "브랜드명"
  }
}
</script>`}
                                />
                              </>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* AI 요약 */}
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        AI 콘텐츠 요약
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {geoResult.llmReadability.summary}
                      </p>
                    </div>

                    {/* E-E-A-T 분석 */}
                    <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
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
            </TabsContent>
          </Tabs>
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
