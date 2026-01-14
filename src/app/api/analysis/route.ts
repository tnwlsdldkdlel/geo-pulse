import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addAnalysisJob } from "@/lib/queue";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL이 필요합니다." },
        { status: 400 }
      );
    }

    // URL 유효성 검사
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "올바른 URL 형식이 아닙니다." },
        { status: 400 }
      );
    }

    // 분석 레코드 생성
    const analysis = await prisma.analysis.create({
      data: {
        url,
        status: "PENDING",
      },
    });

    // 작업 큐에 추가
    await addAnalysisJob(analysis.id, url);

    return NextResponse.json({
      id: analysis.id,
      url: analysis.url,
      status: analysis.status,
    });
  } catch (error) {
    console.error("분석 생성 오류:", error);
    return NextResponse.json(
      { error: "분석 요청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
