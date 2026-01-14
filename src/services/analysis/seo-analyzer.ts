import {
  CrawlResult,
  PageMetadata,
  HeaderStructure,
  SchemaMarkup,
  extractMetadata,
  extractHeaders,
  extractSchemaMarkup,
} from "./crawler";

export interface SEOAnalysisResult {
  score: number;
  meta: {
    score: number;
    title: {
      value: string | null;
      length: number;
      status: "good" | "warning" | "bad";
      message: string;
    };
    description: {
      value: string | null;
      length: number;
      status: "good" | "warning" | "bad";
      message: string;
    };
    keywords: {
      value: string | null;
      status: "good" | "warning" | "bad";
      message: string;
    };
    ogTags: {
      hasTitle: boolean;
      hasDescription: boolean;
      hasImage: boolean;
      status: "good" | "warning" | "bad";
      message: string;
    };
    canonical: {
      value: string | null;
      status: "good" | "warning" | "bad";
      message: string;
    };
  };
  headers: {
    score: number;
    h1Count: number;
    structure: HeaderStructure;
    status: "good" | "warning" | "bad";
    message: string;
  };
  schema: {
    score: number;
    hasSchema: boolean;
    types: string[];
    status: "good" | "warning" | "bad";
    message: string;
  };
  performance: {
    score: number;
    loadTime: number;
    pageSize: number;
    status: "good" | "warning" | "bad";
    message: string;
  };
}

function analyzeMeta(metadata: PageMetadata): SEOAnalysisResult["meta"] {
  let score = 0;
  const maxScore = 40;

  // Title 분석 (10점)
  const titleLength = metadata.title?.length || 0;
  let titleStatus: "good" | "warning" | "bad" = "bad";
  let titleMessage = "";

  if (!metadata.title) {
    titleMessage = "Title 태그가 없습니다.";
  } else if (titleLength < 30) {
    titleStatus = "warning";
    titleMessage = `Title이 너무 짧습니다 (${titleLength}자). 30~60자 권장.`;
    score += 5;
  } else if (titleLength > 60) {
    titleStatus = "warning";
    titleMessage = `Title이 너무 깁니다 (${titleLength}자). 30~60자 권장.`;
    score += 5;
  } else {
    titleStatus = "good";
    titleMessage = `Title 길이가 적절합니다 (${titleLength}자).`;
    score += 10;
  }

  // Description 분석 (10점)
  const descLength = metadata.description?.length || 0;
  let descStatus: "good" | "warning" | "bad" = "bad";
  let descMessage = "";

  if (!metadata.description) {
    descMessage = "Meta Description이 없습니다.";
  } else if (descLength < 70) {
    descStatus = "warning";
    descMessage = `Description이 너무 짧습니다 (${descLength}자). 70~160자 권장.`;
    score += 5;
  } else if (descLength > 160) {
    descStatus = "warning";
    descMessage = `Description이 너무 깁니다 (${descLength}자). 70~160자 권장.`;
    score += 5;
  } else {
    descStatus = "good";
    descMessage = `Description 길이가 적절합니다 (${descLength}자).`;
    score += 10;
  }

  // Keywords 분석 (5점)
  let keywordsStatus: "good" | "warning" | "bad" = "warning";
  let keywordsMessage = "";

  if (metadata.keywords) {
    keywordsStatus = "good";
    keywordsMessage = "Keywords 메타 태그가 있습니다.";
    score += 5;
  } else {
    keywordsMessage = "Keywords 메타 태그가 없습니다 (선택사항).";
  }

  // OG Tags 분석 (10점)
  const hasOgTitle = !!metadata.ogTitle;
  const hasOgDesc = !!metadata.ogDescription;
  const hasOgImage = !!metadata.ogImage;
  const ogCount = [hasOgTitle, hasOgDesc, hasOgImage].filter(Boolean).length;

  let ogStatus: "good" | "warning" | "bad" = "bad";
  let ogMessage = "";

  if (ogCount === 3) {
    ogStatus = "good";
    ogMessage = "모든 OG 태그가 설정되어 있습니다.";
    score += 10;
  } else if (ogCount > 0) {
    ogStatus = "warning";
    ogMessage = `일부 OG 태그가 누락되었습니다 (${ogCount}/3).`;
    score += 5;
  } else {
    ogMessage = "OG 태그가 없습니다. 소셜 미디어 공유 최적화가 필요합니다.";
  }

  // Canonical 분석 (5점)
  let canonicalStatus: "good" | "warning" | "bad" = "warning";
  let canonicalMessage = "";

  if (metadata.canonical) {
    canonicalStatus = "good";
    canonicalMessage = "Canonical URL이 설정되어 있습니다.";
    score += 5;
  } else {
    canonicalMessage = "Canonical URL이 없습니다.";
  }

  return {
    score: Math.round((score / maxScore) * 100),
    title: {
      value: metadata.title,
      length: titleLength,
      status: titleStatus,
      message: titleMessage,
    },
    description: {
      value: metadata.description,
      length: descLength,
      status: descStatus,
      message: descMessage,
    },
    keywords: {
      value: metadata.keywords,
      status: keywordsStatus,
      message: keywordsMessage,
    },
    ogTags: {
      hasTitle: hasOgTitle,
      hasDescription: hasOgDesc,
      hasImage: hasOgImage,
      status: ogStatus,
      message: ogMessage,
    },
    canonical: {
      value: metadata.canonical,
      status: canonicalStatus,
      message: canonicalMessage,
    },
  };
}

function analyzeHeaders(headers: HeaderStructure): SEOAnalysisResult["headers"] {
  let score = 0;
  const maxScore = 20;

  const h1Count = headers.h1.length;

  let status: "good" | "warning" | "bad" = "bad";
  let message = "";

  if (h1Count === 0) {
    message = "H1 태그가 없습니다. 페이지에 하나의 H1 태그가 필요합니다.";
  } else if (h1Count === 1) {
    status = "good";
    message = "H1 태그가 적절하게 사용되었습니다.";
    score += 15;

    // 하위 헤더 존재 시 추가 점수
    if (headers.h2.length > 0) {
      score += 5;
    }
  } else {
    status = "warning";
    message = `H1 태그가 ${h1Count}개 있습니다. 하나만 사용하는 것이 좋습니다.`;
    score += 10;
  }

  return {
    score: Math.round((score / maxScore) * 100),
    h1Count,
    structure: headers,
    status,
    message,
  };
}

function analyzeSchema(schema: SchemaMarkup): SEOAnalysisResult["schema"] {
  let score = 0;
  const maxScore = 20;

  const hasSchema = schema.data.length > 0;

  let status: "good" | "warning" | "bad" = "bad";
  let message = "";

  if (hasSchema) {
    status = "good";
    message = `구조화된 데이터가 있습니다: ${schema.types.join(", ")}`;
    score += 20;
  } else {
    message = "구조화된 데이터(JSON-LD)가 없습니다. 스키마 마크업 추가를 권장합니다.";
  }

  return {
    score: Math.round((score / maxScore) * 100),
    hasSchema,
    types: schema.types,
    status,
    message,
  };
}

function analyzePerformance(
  loadTime: number,
  pageSize: number
): SEOAnalysisResult["performance"] {
  let score = 0;
  const maxScore = 20;

  // 로딩 시간 분석 (10점)
  // 좋음: < 2초, 보통: 2-4초, 나쁨: > 4초
  let timeScore = 0;
  if (loadTime < 2000) {
    timeScore = 10;
  } else if (loadTime < 4000) {
    timeScore = 5;
  }
  score += timeScore;

  // 페이지 크기 분석 (10점)
  // 좋음: < 500KB, 보통: 500KB-1MB, 나쁨: > 1MB
  const pageSizeKB = pageSize / 1024;
  let sizeScore = 0;
  if (pageSizeKB < 500) {
    sizeScore = 10;
  } else if (pageSizeKB < 1024) {
    sizeScore = 5;
  }
  score += sizeScore;

  let status: "good" | "warning" | "bad" = "bad";
  let message = "";

  if (score >= 15) {
    status = "good";
    message = `로딩 속도와 페이지 크기가 양호합니다 (${(loadTime / 1000).toFixed(1)}초, ${pageSizeKB.toFixed(0)}KB).`;
  } else if (score >= 10) {
    status = "warning";
    message = `성능 개선이 필요합니다 (${(loadTime / 1000).toFixed(1)}초, ${pageSizeKB.toFixed(0)}KB).`;
  } else {
    message = `성능이 좋지 않습니다 (${(loadTime / 1000).toFixed(1)}초, ${pageSizeKB.toFixed(0)}KB). 최적화가 필요합니다.`;
  }

  return {
    score: Math.round((score / maxScore) * 100),
    loadTime,
    pageSize,
    status,
    message,
  };
}

export function analyzeSEO(crawlResult: CrawlResult): SEOAnalysisResult {
  const metadata = extractMetadata(crawlResult.html);
  const headers = extractHeaders(crawlResult.html);
  const schema = extractSchemaMarkup(crawlResult.html);

  const metaAnalysis = analyzeMeta(metadata);
  const headersAnalysis = analyzeHeaders(headers);
  const schemaAnalysis = analyzeSchema(schema);
  const performanceAnalysis = analyzePerformance(
    crawlResult.loadTime,
    crawlResult.pageSize
  );

  // 종합 점수 계산 (가중치 적용)
  const totalScore = Math.round(
    metaAnalysis.score * 0.4 +
      headersAnalysis.score * 0.2 +
      schemaAnalysis.score * 0.2 +
      performanceAnalysis.score * 0.2
  );

  return {
    score: totalScore,
    meta: metaAnalysis,
    headers: headersAnalysis,
    schema: schemaAnalysis,
    performance: performanceAnalysis,
  };
}
