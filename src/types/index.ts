// 공통 타입 정의

export interface SEOResult {
  metaTags: {
    title: string | null;
    description: string | null;
    keywords: string | null;
  };
  headers: {
    h1: string[];
    h2: string[];
  };
  schema: Record<string, unknown>[];
  performance: {
    loadTime: number;
    pageSize: number;
  };
}

export interface GEOResult {
  citationReliability: {
    score: number;
    hasStatistics: boolean;
    hasNumbers: boolean;
  };
  llmReadability: {
    score: number;
    summary: string;
  };
  entityOptimization: {
    score: number;
    entities: string[];
  };
}

export interface AnalysisResult {
  seo: SEOResult;
  geo: GEOResult;
  totalScore: number;
  seoScore: number;
  geoScore: number;
}
