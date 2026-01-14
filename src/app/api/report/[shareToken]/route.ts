import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params;

    const analysis = await prisma.analysis.findUnique({
      where: { shareToken },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "리포트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 민감한 정보 제외하고 반환
    return NextResponse.json({
      id: analysis.id,
      url: analysis.url,
      status: analysis.status,
      seoScore: analysis.seoScore,
      geoScore: analysis.geoScore,
      totalScore: analysis.totalScore,
      seoResult: analysis.seoResult,
      geoResult: analysis.geoResult,
      createdAt: analysis.createdAt,
    });
  } catch (error) {
    console.error("공유 리포트 조회 오류:", error);
    return NextResponse.json(
      { error: "리포트 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
