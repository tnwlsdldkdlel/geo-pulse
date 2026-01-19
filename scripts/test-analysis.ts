import "dotenv/config";
import { crawlPage } from "../src/services/analysis/crawler";
import { analyzeSEO } from "../src/services/analysis/seo-analyzer";
import { analyzeGEO } from "../src/services/analysis/geo-analyzer";

async function testAnalysis(url: string) {
  console.log("=".repeat(60));
  console.log(`분석 테스트 시작: ${url}`);
  console.log("=".repeat(60));

  try {
    // 1. 크롤링
    console.log("\n[1/3] 웹페이지 크롤링 중...");
    const startTime = Date.now();
    const crawlResult = await crawlPage(url);
    console.log(`✓ 크롤링 완료 (${crawlResult.loadTime}ms)`);
    console.log(`  - 최종 URL: ${crawlResult.finalUrl}`);
    console.log(`  - 페이지 크기: ${(crawlResult.pageSize / 1024).toFixed(1)}KB`);
    console.log(`  - 텍스트 길이: ${crawlResult.text.length}자`);

    // 2. SEO 분석
    console.log("\n[2/3] SEO 분석 중...");
    const seoResult = analyzeSEO(crawlResult);
    console.log(`✓ SEO 분석 완료 (점수: ${seoResult.score})`);
    console.log(`  - Meta: ${seoResult.meta.score}점 - ${seoResult.meta.title.message}`);
    console.log(`  - Headers: ${seoResult.headers.score}점 - ${seoResult.headers.message}`);
    console.log(`  - Schema: ${seoResult.schema.score}점 - ${seoResult.schema.message}`);
    console.log(`  - Performance: ${seoResult.performance.score}점 - ${seoResult.performance.message}`);

    // 3. GEO 분석
    console.log("\n[3/3] GEO 분석 중 (OpenAI API 호출)...");
    const geoResult = await analyzeGEO(crawlResult);
    console.log(`✓ GEO 분석 완료 (점수: ${geoResult.score})`);
    console.log(`  - 인용 신뢰도: ${geoResult.citationReliability.score}점 - ${geoResult.citationReliability.message}`);
    console.log(`  - LLM 가독성: ${geoResult.llmReadability.score}점 - ${geoResult.llmReadability.message}`);
    console.log(`  - 엔티티 최적화: ${geoResult.entityOptimization.score}점 - ${geoResult.entityOptimization.message}`);

    // 종합 결과
    const totalScore = Math.round(seoResult.score * 0.4 + geoResult.score * 0.6);
    const totalTime = Date.now() - startTime;

    console.log("\n" + "=".repeat(60));
    console.log("분석 결과 요약");
    console.log("=".repeat(60));
    console.log(`총점: ${totalScore}점 (SEO: ${seoResult.score}, GEO: ${geoResult.score})`);
    console.log(`소요 시간: ${(totalTime / 1000).toFixed(1)}초`);

    // 상세 결과 출력 (선택)
    console.log("\n--- SEO 상세 ---");
    console.log(JSON.stringify(seoResult, null, 2));

    console.log("\n--- GEO 상세 ---");
    console.log(JSON.stringify(geoResult, null, 2));

  } catch (error) {
    console.error("\n❌ 분석 실패:", error);
  }
}

// 테스트할 URL (인자로 받거나 기본값 사용)
const testUrl = process.argv[2] || "https://www.naver.com";

testAnalysis(testUrl);
