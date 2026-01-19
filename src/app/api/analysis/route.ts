import { NextRequest } from "next/server";
import { crawlPage } from "@/services/analysis/crawler";
import { analyzeSEO } from "@/services/analysis/seo-analyzer";
import { analyzeGEO } from "@/services/analysis/geo-analyzer";

// 진행 상태 메시지 타입
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

// 고유 ID 생성
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL이 필요합니다." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // URL 유효성 검사
    try {
      new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: "올바른 URL 형식이 아닙니다." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 스트리밍 응답 생성
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const sendMessage = async (message: ProgressMessage) => {
      await writer.write(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
    };

    // 비동기로 분석 실행
    (async () => {
      const analysisId = generateId();

      try {
        // 1단계: 크롤링
        await sendMessage({
          type: "progress",
          stage: "crawling",
          progress: 10,
          message: "웹페이지 크롤링 중...",
        });

        const crawlResult = await crawlPage(url);

        await sendMessage({
          type: "progress",
          stage: "crawling",
          progress: 30,
          message: "크롤링 완료",
        });

        // 2단계: SEO 분석
        await sendMessage({
          type: "progress",
          stage: "seo",
          progress: 40,
          message: "SEO 분석 중...",
        });

        const seoResult = analyzeSEO(crawlResult);

        await sendMessage({
          type: "progress",
          stage: "seo",
          progress: 60,
          message: "SEO 분석 완료",
        });

        // 3단계: GEO 분석
        await sendMessage({
          type: "progress",
          stage: "geo",
          progress: 70,
          message: "GEO 분석 중...",
        });

        const geoResult = await analyzeGEO(crawlResult);

        await sendMessage({
          type: "progress",
          stage: "geo",
          progress: 90,
          message: "GEO 분석 완료",
        });

        // 종합 점수 계산
        const totalScore = Math.round((seoResult.score + geoResult.score) / 2);

        // 완료
        const analysisResult: AnalysisResult = {
          id: analysisId,
          url,
          status: "COMPLETED",
          seoScore: seoResult.score,
          geoScore: geoResult.score,
          totalScore,
          seoResult,
          geoResult,
          createdAt: new Date().toISOString(),
        };

        await sendMessage({
          type: "complete",
          progress: 100,
          message: "분석 완료",
          data: analysisResult,
        });
      } catch (error) {
        console.error("분석 오류:", error);
        await sendMessage({
          type: "error",
          error: error instanceof Error ? error.message : "분석 중 오류가 발생했습니다.",
        });
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("분석 요청 오류:", error);
    return new Response(
      JSON.stringify({ error: "분석 요청 처리 중 오류가 발생했습니다." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
