import redis from "./redis";
import { randomBytes } from "crypto";

// 분석 데이터 타입 (DB 스키마 대체)
export interface AnalysisData {
  id: string;
  url: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
  updatedAt: string;
  seoScore: number | null;
  geoScore: number | null;
  totalScore: number | null;
  seoResult: unknown | null;
  geoResult: unknown | null;
  shareToken: string | null;
}

const ANALYSIS_PREFIX = "analysis:";
const SHARE_TOKEN_PREFIX = "share:";
const ANALYSIS_TTL = 60 * 60 * 24; // 24시간

// 분석 생성
export async function createAnalysis(url: string): Promise<AnalysisData> {
  const id = randomBytes(12).toString("hex");
  const now = new Date().toISOString();

  const analysis: AnalysisData = {
    id,
    url,
    status: "PENDING",
    createdAt: now,
    updatedAt: now,
    seoScore: null,
    geoScore: null,
    totalScore: null,
    seoResult: null,
    geoResult: null,
    shareToken: null,
  };

  await redis.setex(
    `${ANALYSIS_PREFIX}${id}`,
    ANALYSIS_TTL,
    JSON.stringify(analysis)
  );

  return analysis;
}

// 분석 조회
export async function getAnalysis(id: string): Promise<AnalysisData | null> {
  const data = await redis.get(`${ANALYSIS_PREFIX}${id}`);
  if (!data) return null;
  return JSON.parse(data) as AnalysisData;
}

// 분석 업데이트
export async function updateAnalysis(
  id: string,
  updates: Partial<AnalysisData>
): Promise<AnalysisData | null> {
  const analysis = await getAnalysis(id);
  if (!analysis) return null;

  const updated: AnalysisData = {
    ...analysis,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await redis.setex(
    `${ANALYSIS_PREFIX}${id}`,
    ANALYSIS_TTL,
    JSON.stringify(updated)
  );

  // 공유 토큰이 있으면 매핑도 저장
  if (updates.shareToken) {
    await redis.setex(
      `${SHARE_TOKEN_PREFIX}${updates.shareToken}`,
      ANALYSIS_TTL,
      id
    );
  }

  return updated;
}

// 공유 토큰으로 분석 조회
export async function getAnalysisByShareToken(
  shareToken: string
): Promise<AnalysisData | null> {
  const id = await redis.get(`${SHARE_TOKEN_PREFIX}${shareToken}`);
  if (!id) return null;
  return getAnalysis(id);
}

// 공유 토큰 생성
export async function createShareToken(id: string): Promise<string | null> {
  const analysis = await getAnalysis(id);
  if (!analysis) return null;

  // 이미 토큰이 있으면 반환
  if (analysis.shareToken) {
    return analysis.shareToken;
  }

  const shareToken = randomBytes(16).toString("hex");
  await updateAnalysis(id, { shareToken });

  return shareToken;
}
