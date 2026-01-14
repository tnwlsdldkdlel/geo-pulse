import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const analysis = await prisma.analysis.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        url: true,
        seoScore: true,
        geoScore: true,
        totalScore: true,
        updatedAt: true,
      },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "분석 결과를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("분석 상태 조회 오류:", error);
    return NextResponse.json(
      { error: "분석 상태 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
