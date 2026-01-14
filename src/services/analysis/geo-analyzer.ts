import OpenAI from "openai";
import { CrawlResult } from "./crawler";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GEOAnalysisResult {
  score: number;
  citationReliability: {
    score: number;
    hasStatistics: boolean;
    hasSources: boolean;
    eeatScore: number;
    status: "good" | "warning" | "bad";
    message: string;
    details: string;
  };
  llmReadability: {
    score: number;
    isAnswerReady: boolean;
    status: "good" | "warning" | "bad";
    message: string;
    summary: string;
  };
  structuralOptimization: {
    score: number;
    listUtilization: number;
    tableUtilization: number;
    hierarchyScore: number;
    snippetPotential: "High" | "Medium" | "Low";
    status: "good" | "warning" | "bad";
    message: string;
  };
  entityOptimization: {
    score: number;
    entities: string[];
    status: "good" | "warning" | "bad";
    message: string;
  };
  actionableInsights: {
    forMarketer: string;
    forDeveloper: string;
  };
}

interface AIAnalysisResponse {
  citationReliability: {
    score: number;
    hasStatistics: boolean;
    hasSources: boolean;
    eeatScore: number;
    details: string;
  };
  llmReadability: {
    score: number;
    isAnswerReady: boolean;
    summary: string;
  };
  structuralOptimization: {
    score: number;
    listUtilization: number;
    tableUtilization: number;
    hierarchyScore: number;
    snippetPotential: "High" | "Medium" | "Low";
  };
  entityOptimization: {
    score: number;
    entities: string[];
  };
  actionableInsights: {
    forMarketer: string;
    forDeveloper: string;
  };
}

function truncateText(text: string, maxLength: number = 8000): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

async function analyzeWithAI(text: string, url: string): Promise<AIAnalysisResponse> {
  const truncatedText = truncateText(text);

  const prompt = `다음 웹페이지 콘텐츠를 AI 검색 엔진 최적화(GEO) 관점에서 분석해주세요.
콘텐츠가 마크다운 형식이면 리스트(*)나 표(|) 구조를 적극 반영하여 분석하세요.

URL: ${url}

콘텐츠:
${truncatedText}

다음 JSON 형식으로 분석 결과를 반환해주세요:

{
  "citationReliability": {
    "score": 0-100,
    "hasStatistics": true/false,
    "hasSources": true/false,
    "eeatScore": 0-100,
    "details": "인용 신뢰도 분석 결과 (한국어)"
  },
  "llmReadability": {
    "score": 0-100,
    "isAnswerReady": true/false,
    "summary": "AI 요약 (한국어)"
  },
  "structuralOptimization": {
    "score": 0-100,
    "listUtilization": 0-100 (불렛포인트/번호 매기기 활용도),
    "tableUtilization": 0-100 (데이터 표 활용도),
    "hierarchyScore": 0-100 (H1, H2, H3 등 계층 구조의 논리성),
    "snippetPotential": "High/Medium/Low (AI 검색 상단 스니펫 채택 가능성)"
  },
  "entityOptimization": {
    "score": 0-100,
    "entities": ["엔티티1", "엔티티2"]
  },
  "actionableInsights": {
    "forMarketer": "마케팅 관점 개선 가이드",
    "forDeveloper": "기술적(스키마, 태그) 개선 가이드"
  }
}

JSON만 반환하고 다른 텍스트는 포함하지 마세요.`;

  try {
    console.log("[GEO] OpenAI API 호출 중...");
    console.log("[GEO] 분석할 텍스트 길이:", truncatedText.length, "자");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "당신은 SEO 및 AI 검색 최적화 전문가입니다. 웹 콘텐츠를 분석하여 AI 검색 엔진(ChatGPT, Perplexity 등)에서의 가시성을 평가합니다. 항상 유효한 JSON 형식으로만 응답하세요.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    console.log("[GEO] OpenAI 원본 응답:", content);

    if (!content) {
      throw new Error("OpenAI 응답이 비어있습니다.");
    }

    // JSON 파싱
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("JSON 형식을 찾을 수 없습니다.");
    }

    const parsedResult = JSON.parse(jsonMatch[0]) as AIAnalysisResponse;
    console.log("[GEO] 파싱된 결과:", JSON.stringify(parsedResult, null, 2));

    return parsedResult;
  } catch (error) {
    console.error("OpenAI 분석 오류:", error);

    // 기본값 반환
    return {
      citationReliability: {
        score: 50,
        hasStatistics: false,
        hasSources: false,
        eeatScore: 50,
        details: "AI 분석을 수행할 수 없습니다.",
      },
      llmReadability: {
        score: 50,
        isAnswerReady: false,
        summary: "콘텐츠 요약을 생성할 수 없습니다.",
      },
      structuralOptimization: {
        score: 50,
        listUtilization: 50,
        tableUtilization: 50,
        hierarchyScore: 50,
        snippetPotential: "Medium",
      },
      entityOptimization: {
        score: 50,
        entities: [],
      },
      actionableInsights: {
        forMarketer: "분석을 수행할 수 없습니다.",
        forDeveloper: "분석을 수행할 수 없습니다.",
      },
    };
  }
}

function getStatus(score: number): "good" | "warning" | "bad" {
  if (score >= 70) return "good";
  if (score >= 40) return "warning";
  return "bad";
}

function getCitationMessage(analysis: AIAnalysisResponse["citationReliability"]): string {
  if (analysis.score >= 70) {
    return "AI가 이 콘텐츠를 출처로 인용할 가능성이 높습니다.";
  } else if (analysis.score >= 40) {
    return "인용 가능성이 보통입니다. 통계나 출처 추가를 권장합니다.";
  }
  return "인용 가능성이 낮습니다. 신뢰성 있는 데이터와 출처를 추가하세요.";
}

function getReadabilityMessage(analysis: AIAnalysisResponse["llmReadability"]): string {
  if (analysis.score >= 70) {
    return "AI가 콘텐츠를 이해하고 요약하기 쉬운 구조입니다.";
  } else if (analysis.score >= 40) {
    return "가독성이 보통입니다. 문장을 더 명확하게 작성하세요.";
  }
  return "AI가 이해하기 어려운 구조입니다. 콘텐츠 구조화가 필요합니다.";
}

function getStructuralMessage(analysis: AIAnalysisResponse["structuralOptimization"]): string {
  if (analysis.score >= 70) {
    return "콘텐츠 구조가 AI 검색에 최적화되어 있습니다.";
  } else if (analysis.score >= 40) {
    return "구조 개선이 필요합니다. 리스트나 표를 활용하세요.";
  }
  return "콘텐츠 구조화가 미흡합니다. 계층 구조와 리스트를 추가하세요.";
}

function getEntityMessage(analysis: AIAnalysisResponse["entityOptimization"]): string {
  if (analysis.score >= 70) {
    return "브랜드와 주제의 연결이 명확합니다.";
  } else if (analysis.score >= 40) {
    return "엔티티 최적화가 보통입니다. 브랜드 언급을 강화하세요.";
  }
  return "브랜드와 주제의 연결이 약합니다. 엔티티 최적화가 필요합니다.";
}

export async function analyzeGEO(crawlResult: CrawlResult): Promise<GEOAnalysisResult> {
  const aiAnalysis = await analyzeWithAI(crawlResult.text, crawlResult.url);

  const citationScore = aiAnalysis.citationReliability.score;
  const readabilityScore = aiAnalysis.llmReadability.score;
  const structuralScore = aiAnalysis.structuralOptimization.score;
  const entityScore = aiAnalysis.entityOptimization.score;

  // 종합 점수 계산 (가중치: 인용 30%, 가독성 25%, 구조 25%, 엔티티 20%)
  const totalScore = Math.round(
    citationScore * 0.3 + readabilityScore * 0.25 + structuralScore * 0.25 + entityScore * 0.2
  );

  return {
    score: totalScore,
    citationReliability: {
      score: citationScore,
      hasStatistics: aiAnalysis.citationReliability.hasStatistics,
      hasSources: aiAnalysis.citationReliability.hasSources,
      eeatScore: aiAnalysis.citationReliability.eeatScore,
      status: getStatus(citationScore),
      message: getCitationMessage(aiAnalysis.citationReliability),
      details: aiAnalysis.citationReliability.details,
    },
    llmReadability: {
      score: readabilityScore,
      isAnswerReady: aiAnalysis.llmReadability.isAnswerReady,
      status: getStatus(readabilityScore),
      message: getReadabilityMessage(aiAnalysis.llmReadability),
      summary: aiAnalysis.llmReadability.summary,
    },
    structuralOptimization: {
      score: structuralScore,
      listUtilization: aiAnalysis.structuralOptimization.listUtilization,
      tableUtilization: aiAnalysis.structuralOptimization.tableUtilization,
      hierarchyScore: aiAnalysis.structuralOptimization.hierarchyScore,
      snippetPotential: aiAnalysis.structuralOptimization.snippetPotential,
      status: getStatus(structuralScore),
      message: getStructuralMessage(aiAnalysis.structuralOptimization),
    },
    entityOptimization: {
      score: entityScore,
      entities: aiAnalysis.entityOptimization.entities,
      status: getStatus(entityScore),
      message: getEntityMessage(aiAnalysis.entityOptimization),
    },
    actionableInsights: {
      forMarketer: aiAnalysis.actionableInsights.forMarketer,
      forDeveloper: aiAnalysis.actionableInsights.forDeveloper,
    },
  };
}
