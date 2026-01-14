import { Queue, Worker, Job } from "bullmq";
import redis from "./redis";

// 분석 작업 데이터 타입
export interface AnalysisJobData {
  analysisId: string;
  url: string;
}

// 분석 작업 결과 타입
export interface AnalysisJobResult {
  success: boolean;
  seoScore?: number;
  geoScore?: number;
  totalScore?: number;
  error?: string;
}

// 분석 작업 큐
export const analysisQueue = new Queue<AnalysisJobData, AnalysisJobResult>(
  "analysis",
  {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: {
        count: 100,
      },
      removeOnFail: {
        count: 50,
      },
    },
  }
);

// 분석 작업 추가 헬퍼 함수
export async function addAnalysisJob(
  analysisId: string,
  url: string
): Promise<Job<AnalysisJobData, AnalysisJobResult>> {
  return analysisQueue.add(
    "analyze",
    { analysisId, url },
    { jobId: analysisId }
  );
}

// 워커 생성 함수 (워커 프로세스에서 사용)
export function createAnalysisWorker(
  processor: (job: Job<AnalysisJobData>) => Promise<AnalysisJobResult>
): Worker<AnalysisJobData, AnalysisJobResult> {
  return new Worker<AnalysisJobData, AnalysisJobResult>("analysis", processor, {
    connection: redis,
    concurrency: 5,
  });
}
