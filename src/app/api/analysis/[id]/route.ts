import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma"; // DB 비활성화
import { getAnalysis } from "@/lib/analysis-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // [DB 비활성화] Prisma 대신 Redis 저장소 사용
    // const analysis = await prisma.analysis.findUnique({
    //   where: { id },
    // });

    const analysis = await getAnalysis(id);

    if (!analysis) {
      return NextResponse.json(
        { error: "분석 결과를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("분석 조회 오류:", error);
    return NextResponse.json(
      { error: "분석 결과 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
