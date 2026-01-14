# GEO-Pulse 개발 작업 계획

## Phase 1: MVP 핵심 기능 개발

### 1.1 인프라 및 기본 설정
- [x] Next.js 프로젝트 초기화 (TypeScript, App Router)
- [x] Tailwind CSS + shadcn/ui 설정
- [x] Prisma 설정 및 기본 스키마 정의
- [x] Docker Compose 설정 (PostgreSQL, Redis)
- [x] Redis 클라이언트 및 BullMQ 큐 설정
- [x] 환경변수 관리 체계 구축 (@t3-oss/env-nextjs)
- [ ] DB 마이그레이션 실행 (Docker 실행 후 `npx prisma migrate dev`)

### 1.2 인증 및 사용자 관리
- [ ] 이메일 기반 인증 시스템 구현
- [ ] 사용자 프로필 페이지
- [ ] 세션 관리

### 1.3 URL 분석 기능
- [ ] URL 입력 폼 UI 구현
- [ ] 분석 작업 생성 API (`POST /api/analysis`)
- [ ] 분석 상태 조회 API (`GET /api/analysis/[id]`)
- [ ] 분석 결과 목록 API (`GET /api/analyses`)

### 1.4 SEO 분석 엔진 (40%)
- [ ] Playwright 기반 웹 크롤러 구현
- [ ] Meta 태그 분석 (title, description, keywords)
- [ ] Header 구조 분석 (H1~H6)
- [ ] 스키마 마크업 검출 및 검증
- [ ] 페이지 성능 측정 (로딩 시간, 페이지 크기)

### 1.5 GEO 분석 엔진 (60%)
- [ ] OpenAI API 연동
- [ ] 인용 신뢰도 분석 (수치/통계 데이터 포함 여부)
- [ ] LLM 가독성 분석 (요약 시뮬레이션)
- [ ] 엔티티 최적화 분석 (브랜드-카테고리 연결 강도)

### 1.6 워커 시스템
- [ ] BullMQ 작업 큐 구현
- [ ] 분석 워커 프로세스 개발
- [ ] 작업 상태 업데이트 로직
- [ ] 에러 핸들링 및 재시도 로직

---

## Phase 2: 대시보드 및 리포트

### 2.1 대시보드 UI
- [ ] 메인 대시보드 레이아웃
- [ ] 가시성 스코어 게이지 바 컴포넌트
- [ ] SEO/GEO 점수 레이더 차트
- [ ] 분석 히스토리 테이블

### 2.2 상세 리포트 페이지
- [ ] SEO 분석 결과 섹션
- [ ] GEO 분석 결과 섹션
- [ ] 개선 권장사항 목록

### 2.3 실행 가이드 (Actionable Insights)
- [ ] 마케터용 가이드 (비즈니스 관점 설명)
- [ ] 개발자용 가이드 (코드 수정 가이드라인)

### 2.4 경쟁사 비교 기능
- [ ] 경쟁사 URL 입력 UI
- [ ] 1:1 비교 레이아웃
- [ ] 비교 차트 컴포넌트

---

## Phase 3: 공유 및 내보내기

### 3.1 Public 공유 기능
- [ ] 공유 토큰 생성 로직
- [ ] Public 리포트 페이지 (`/report/[shareToken]`)
- [ ] 공유 링크 복사 UI

### 3.2 PDF 리포트
- [ ] Playwright PDF 생성 로직
- [ ] PDF 템플릿 디자인
- [ ] PDF 다운로드 API

### 3.3 이메일 알림
- [ ] Resend 연동
- [ ] 분석 완료 알림 이메일 템플릿
- [ ] 이메일 발송 로직

---

## Phase 4: 수익화 및 운영

### 4.1 결제 시스템
- [ ] Freemium 제한 로직 (1회 무료)
- [ ] Single Pass 결제 연동
- [ ] Subscription 플랜 구현

### 4.2 관리자 기능
- [ ] 사용자 관리 대시보드
- [ ] 분석 통계 대시보드
- [ ] 시스템 모니터링

---

## 기술 부채 및 최적화

### 성능 최적화
- [ ] 분석 결과 캐싱
- [ ] 이미지 최적화
- [ ] 번들 사이즈 최적화

### 테스트
- [ ] 단위 테스트 작성
- [ ] E2E 테스트 작성
- [ ] API 테스트 작성

### 문서화
- [ ] API 문서 작성
- [ ] 컴포넌트 문서화
- [ ] 배포 가이드 작성

---

## 파일 구조 계획

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── analysis/[id]/
│   │   └── settings/
│   ├── report/[shareToken]/
│   └── api/
│       ├── auth/
│       ├── analysis/
│       └── report/
├── components/
│   ├── ui/              # shadcn/ui 컴포넌트
│   ├── charts/          # 차트 컴포넌트
│   ├── forms/           # 폼 컴포넌트
│   └── layout/          # 레이아웃 컴포넌트
├── lib/
│   ├── prisma.ts
│   ├── redis.ts
│   ├── openai.ts
│   └── utils.ts
├── services/
│   ├── seo-analyzer.ts
│   ├── geo-analyzer.ts
│   └── crawler.ts
├── workers/
│   └── analysis-worker.ts
└── types/
    └── index.ts
```

---

## 환경 변수

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 연결 URL | ✅ |
| `REDIS_URL` | Redis 연결 URL | ✅ |
| `OPENAI_API_KEY` | OpenAI API 키 | ✅ |
| `RESEND_API_KEY` | Resend API 키 | ✅ |
| `NEXT_PUBLIC_APP_URL` | 앱 공개 URL | ✅ |
