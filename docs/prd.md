# [PRD] AI 검색 가시성 및 종합 SEO 진단 솔루션: GEO-Pulse

## 1. 프로젝트 개요
* **제품명:** GEO-Pulse (가칭)
* **목적:** URL 기반 AI 검색 엔진 최적화(GEO) 및 전통적 검색 엔진 최적화(SEO) 상태를 진단하고 시각화된 대시보드와 리포트를 제공하는 솔루션
* **핵심 타겟:** 마케팅 대행사(제안서 작성용), 인하우스 마케터(의사결정 및 개발 요청용)

---

## 2. 기술 스택 (Tech Stack)

### 2.1 Web & UI (Frontend / API)
* **Framework:** Next.js 14+ (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS, shadcn/ui (Radix UI 기반 고성능 대시보드 구현)
* **ORM:** Prisma

### 2.2 Data & Queue (Middleware)
* **Database:** PostgreSQL
* **Caching & Queue:** Redis, BullMQ (대량의 분석 작업을 안정적으로 처리하기 위한 비동기 큐 시스템)

### 2.3 Worker & Analysis (AWS ECS/Fargate)
* **Runtime:** Node.js
* **Scraping:** Playwright (Headless Browser를 통한 JS 렌더링 및 스크린샷), cheerio (빠른 DOM 파싱 및 데이터 추출)
* **AI Engine:** OpenAI API (GPT-4o) - 콘텐츠 가독성 및 AI 인용 가능성 분석

### 2.4 Infra & Tools
* **Deployment:** Vercel (Next.js 웹 서비스), AWS ECS/Fargate (확장 가능한 분석 워커)
* **Notification:** Resend (이메일 발송), 알림톡 (필요 시 연동)
* **Export:** Playwright PDF (대시보드 UI를 그대로 PDF 리포트로 변환)

---

## 3. 핵심 아키텍처 및 시스템 흐름



1. **사용자 요청:** 사용자가 대시보드에서 URL을 입력하고 분석을 시작합니다.
2. **작업 할당:** Next.js API는 분석 Task를 생성하여 Redis/BullMQ에 적재합니다.
3. **워커 처리:** ECS Fargate에서 대기 중인 워커가 작업을 가져와 Playwright로 웹을 크롤링하고 OpenAI로 GEO 점수를 분석합니다.
4. **결과 업데이트:** 분석 결과가 DB에 저장되면 클라이언트는 실시간으로 대시보드 상태 변화를 확인합니다.
5. **리포트 완료:** 분석이 끝나면 PDF가 생성되고 Resend를 통해 사용자에게 이메일로 링크가 전송됩니다.

---

## 4. 기능적 요구사항 (Functional Requirements)

### 4.1 하이브리드 진단 엔진
* **SEO (40%):** 웹 표준 준수 여부(Meta, Header 구조), 스키마 마크업 누락 여부, 페이지 성능 측정
* **GEO (60%):** * **인용 신뢰도:** 수치 데이터 및 통계 포함 여부를 통한 AI 답변 출처 채택 가능성 분석
    * **LLM 가독성:** AI가 본문을 요약할 때 핵심 정보가 누락되지 않는 구조인지 시뮬레이션
    * **엔티티 최적화:** 특정 제품/서비스 카테고리와 브랜드의 연결 강도 분석

### 4.2 대시보드 및 리포트
* **가시성 스코어:** 레이더 차트 및 게이지 바를 이용한 직관적인 최적화 점수 표기
* **경쟁사 비교 (MVP):** 사용자 입력 기반 경쟁사 URL과 1:1 데이터 대조 레이아웃
* **Public 공유:** 별도의 로그인 없이 결과 리포트를 확인할 수 있는 고유 공유 URL 제공

### 4.3 실행 가이드 (Actionable Insights)
* **마케터용:** 문제의 원인과 비즈니스 관점의 기대 효과를 평이한 언어로 설명
* **개발자용:** 수정해야 할 태그, 스키마 마크업 코드 가이드라인 제공

---

## 5. 수익 모델 및 운영 계획
* **Freemium:** 1회 무료 진단 및 기초 점수 확인
* **Single Pass:** 심화 분석 리포트 결제 및 PDF 다운로드 기능 활성화
* **Subscription:** 다수 URL 관리 기능 및 대행사용 리포트 커스터마이징 기능 제공

---

## 6. 향후 확장성 (Roadmap)
* **Phase 1:** URL 입력 기반의 GEO/SEO 진단 MVP 출시
* **Phase 2:** 특정 키워드 검색 시 상위 경쟁사를 자동으로 탐색하고 비교하는 기능 추가
* **Phase 3:** 주요 커머스 및 블로그 플랫폼(워드프레스 등) 전용 플러그인 개발