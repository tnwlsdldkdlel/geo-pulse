import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { UrlInputForm } from "@/components/forms/url-input-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-20 md:py-32">
          <div className="container relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-4">
                AI 기반 검색 최적화 분석
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                AI 시대의{" "}
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  검색 가시성
                </span>
                을 진단하세요
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                GEO-Pulse는 전통적인 SEO와 AI 검색 엔진 최적화(GEO)를 함께
                분석하여 당신의 웹사이트가 ChatGPT, Perplexity 등 AI 검색에서
                얼마나 잘 노출되는지 진단합니다.
              </p>

              <div className="mt-10">
                <UrlInputForm size="large" className="max-w-2xl mx-auto" />
                <p className="mt-4 text-sm text-muted-foreground">
                  무료로 1회 분석 가능 · 회원가입 불필요
                </p>
              </div>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold md:text-4xl">
                SEO + GEO 하이브리드 진단
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                전통적인 SEO 점검과 AI 검색 최적화 분석을 한 번에
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* SEO Features */}
              <Card className="border-2 hover:border-blue-500/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Meta 태그 분석</h3>
                  <p className="text-muted-foreground">
                    Title, Description, Keywords 등 메타 태그 최적화 상태를
                    점검합니다.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-blue-500/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">헤더 구조 분석</h3>
                  <p className="text-muted-foreground">
                    H1~H6 태그의 계층 구조와 키워드 사용 현황을 분석합니다.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-blue-500/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">스키마 마크업</h3>
                  <p className="text-muted-foreground">
                    구조화된 데이터(JSON-LD) 적용 여부와 유효성을 검사합니다.
                  </p>
                </CardContent>
              </Card>

              {/* GEO Features */}
              <Card className="border-2 hover:border-violet-500/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
                    <svg
                      className="h-6 w-6 text-violet-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">인용 신뢰도</h3>
                  <p className="text-muted-foreground">
                    AI가 답변의 출처로 채택할 가능성을 분석합니다. 수치 데이터
                    포함 여부 등을 평가합니다.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-violet-500/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
                    <svg
                      className="h-6 w-6 text-violet-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">LLM 가독성</h3>
                  <p className="text-muted-foreground">
                    AI가 콘텐츠를 요약할 때 핵심 정보가 잘 전달되는지
                    시뮬레이션합니다.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-violet-500/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
                    <svg
                      className="h-6 w-6 text-violet-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">엔티티 최적화</h3>
                  <p className="text-muted-foreground">
                    브랜드와 제품/서비스 카테고리 간의 연결 강도를 분석합니다.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-20 md:py-28 bg-muted/30">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold md:text-4xl">사용 방법</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                3단계로 간단하게 분석 결과를 확인하세요
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">URL 입력</h3>
                <p className="text-muted-foreground">
                  분석하고 싶은 웹페이지의 URL을 입력합니다.
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">AI 분석</h3>
                <p className="text-muted-foreground">
                  SEO와 GEO 점수를 AI가 자동으로 분석합니다.
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">리포트 확인</h3>
                <p className="text-muted-foreground">
                  상세 리포트와 개선 가이드를 확인합니다.
                </p>
              </div>
            </div>

            <div className="mt-16 text-center">
              <UrlInputForm size="large" className="max-w-2xl mx-auto" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
