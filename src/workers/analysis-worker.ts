import "dotenv/config";
import { Job } from "bullmq";
// import { PrismaClient } from "@prisma/client"; // DB 비활성화
import { createAnalysisWorker, AnalysisJobData, AnalysisJobResult } from "../lib/queue";
import { getAnalysis, updateAnalysis } from "../lib/analysis-store";
import { crawlPage, closeBrowser } from "../services/analysis/crawler";
import { analyzeSEO } from "../services/analysis/seo-analyzer";
import { analyzeGEO } from "../services/analysis/geo-analyzer";

// [DB 비활성화] Prisma 클라이언트 제거
// const prisma = new PrismaClient();

async function processAnalysis(
  job: Job<AnalysisJobData>
): Promise<AnalysisJobResult> {
  const { analysisId, url } = job.data;

  console.log(`[Worker] 분석 시작: ${url} (ID: ${analysisId})`);

  try {
    // [DB 비활성화] Prisma 대신 Redis 저장소 사용
    // await prisma.analysis.update({
    //   where: { id: analysisId },
    //   data: { status: "PROCESSING" },
    // });

    await updateAnalysis(analysisId, { status: "PROCESSING" });

    // 1단계: 웹페이지 크롤링
    console.log(`[Worker] 크롤링 중: ${url}`);
    await job.updateProgress(10);

    const crawlResult = await crawlPage(url);
    console.log(`[Worker] 크롤링 완료: ${crawlResult.loadTime}ms`);
    await job.updateProgress(30);

    // 2단계: SEO 분석
    console.log(`[Worker] SEO 분석 중...`);
    const seoResult = analyzeSEO(crawlResult);
    console.log(`[Worker] SEO 점수: ${seoResult.score}`);
    await job.updateProgress(50);

    // 3단계: GEO 분석
    console.log(`[Worker] GEO 분석 중...`);
    const geoResult = await analyzeGEO(crawlResult);
    console.log(`[Worker] GEO 점수: ${geoResult.score}`);
    await job.updateProgress(80);

    // 종합 점수 계산 (SEO 40%, GEO 60%)
    const totalScore = Math.round(seoResult.score * 0.4 + geoResult.score * 0.6);

    // [DB 비활성화] Prisma 대신 Redis 저장소 사용
    // await prisma.analysis.update({
    //   where: { id: analysisId },
    //   data: {
    //     status: "COMPLETED",
    //     seoScore: seoResult.score,
    //     geoScore: geoResult.score,
    //     totalScore,
    //     seoResult: JSON.parse(JSON.stringify(seoResult)),
    //     geoResult: JSON.parse(JSON.stringify(geoResult)),
    //   },
    // });

    await updateAnalysis(analysisId, {
      status: "COMPLETED",
      seoScore: seoResult.score,
      geoScore: geoResult.score,
      totalScore,
      seoResult: JSON.parse(JSON.stringify(seoResult)),
      geoResult: JSON.parse(JSON.stringify(geoResult)),
    });

    await job.updateProgress(100);

    console.log(`[Worker] 분석 완료: ${url} (총점: ${totalScore})`);

    return {
      success: true,
      seoScore: seoResult.score,
      geoScore: geoResult.score,
      totalScore,
    };
  } catch (error) {
    console.error(`[Worker] 분석 실패: ${url}`, error);

    // [DB 비활성화] Prisma 대신 Redis 저장소 사용
    // await prisma.analysis.update({
    //   where: { id: analysisId },
    //   data: { status: "FAILED" },
    // });

    await updateAnalysis(analysisId, { status: "FAILED" });

    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

// 워커 시작
const worker = createAnalysisWorker(processAnalysis);

worker.on("completed", (job, result) => {
  console.log(`[Worker] 작업 완료: ${job.id}`, result);
});

worker.on("failed", (job, error) => {
  console.error(`[Worker] 작업 실패: ${job?.id}`, error);
});

worker.on("error", (error) => {
  console.error("[Worker] 워커 오류:", error);
});

// 종료 처리
process.on("SIGINT", async () => {
  console.log("[Worker] 종료 중...");
  await worker.close();
  await closeBrowser();
  // [DB 비활성화] Prisma disconnect 제거
  // await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("[Worker] 종료 중...");
  await worker.close();
  await closeBrowser();
  // [DB 비활성화] Prisma disconnect 제거
  // await prisma.$disconnect();
  process.exit(0);
});

console.log("[Worker] 분석 워커 시작됨. 작업 대기 중...");
