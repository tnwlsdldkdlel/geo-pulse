import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma"; // DB 비활성화
// import { randomBytes } from "crypto";
import { getAnalysis, createShareToken } from "@/lib/analysis-store";

export async function POST(
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

    // 이미 공유 토큰이 있으면 반환
    if (analysis.shareToken) {
      return NextResponse.json({
        shareToken: analysis.shareToken,
        shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/report/${analysis.shareToken}`,
      });
    }

    // [DB 비활성화] Prisma 대신 Redis 저장소 사용
    // const shareToken = randomBytes(16).toString("hex");
    // await prisma.analysis.update({
    //   where: { id },
    //   data: { shareToken },
    // });

    const shareToken = await createShareToken(id);

    return NextResponse.json({
      shareToken,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/report/${shareToken}`,
    });
  } catch (error) {
    console.error("공유 토큰 생성 오류:", error);
    return NextResponse.json(
      { error: "공유 링크 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
