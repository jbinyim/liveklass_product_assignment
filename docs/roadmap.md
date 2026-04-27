# 라이브클래스 FE-A — 개발 로드맵

5일 안에 다단계 수강 신청 폼을 완성하기 위한 사람 중심 가이드. 디테일한 TDD Task는 `docs/superpowers/plans/2026-04-27-multi-step-enrollment-form.md`를 참고하고, 이 문서는 **빠르게 흐름을 잡고 일정을 맞추기 위한 용도**다.

---

## 0. 빠른 체크리스트

평가 기준과 명세를 한눈에. 작업 중 누락 방지용.

### 명세 필수 구현
- [ ] 1단계 — 강의 목록(카테고리별) + 정보 표시 + 신청 유형 선택
- [ ] 2단계 — 공통 4필드 + 단체 시 추가 4필드 (단체명/인원/참가자/담당자)
- [ ] 3단계 — 입력 요약 + 수정 링크 + 약관 + 제출
- [ ] 결과 — 성공: 신청 번호 / 실패: 에러 + 재시도 + 데이터 유지
- [ ] 스텝 전환 시 해당 스텝 검증
- [ ] 이전 스텝 이동 시 입력 데이터 유지
- [ ] 스텝 인디케이터

### 평가 기준 직결 (변별 포인트)
- [ ] **D001** 개인↔단체 전환 시 입력값 있으면 확인 모달 + 초기화
- [ ] **D003** 참가자 간 + 신청자↔참가자 이메일 중복 zod refine, blur 검증
- [ ] **D004** 잔여 5석 이하 마감임박 배지, 0석은 회색+클릭 차단, 클라+서버 양쪽 검증
- [ ] **D005** `COURSE_FULL`/`DUPLICATE_ENROLLMENT`/`INVALID_INPUT`/네트워크 각각 다른 UX
- [ ] 첫 에러 필드로 포커스 + 스크롤
- [ ] 단일 RHF + FormProvider, 스텝별 schema 분리(`trigger(STEP_FIELDS[step])`)
- [ ] discriminated union (`type` 판별자)
- [ ] 컴포넌트 4 레이어 분리 (page/컨테이너/표현/UI 원자)
- [ ] 제출 버튼 연타 방지 (mutation.isPending)
- [ ] 강의 목록 로딩/빈/에러 상태 UI 명시
- [ ] 3단계 "수정" 링크로 해당 스텝 점프

### 선택 구현 (가산점)
- [ ] localStorage 임시 저장 + 복원 모달 (D006)
- [ ] beforeunload 이탈 방지 (D013, isDirty일 때만)
- [ ] 참가자 일괄 입력 모달 (D008-c B안)
- [ ] 키보드 네비 (Tab/Enter, D008-c A안)

### 제출물
- [ ] public repo, `main` 브랜치, `npm i && npm run dev` 즉시 실행 가능
- [ ] README 8 섹션 (개요/기술스택/실행/구조/요구사항해석/설계결정/미구현/AI활용)
- [ ] 의미 단위 커밋 히스토리 (전체 dump 금지)
- [ ] 테스트 통과 (`npm test`)

---

## 1. 전체 흐름 — Phase 가이드

코드는 아래에서 위로 쌓는다. 각 Phase는 다음 Phase의 전제다.

### Phase 1 — 환경 셋업
**산출물:** Next.js 15 + TS strict + Tailwind + Vitest + RTL + MSW 의존성. globals.css에 디자인 토큰 변수 정의(D016 라이브클래스 톤). Pretendard CDN 로드. 스모크 테스트 통과.
**핵심 파일:** `package.json`, `tsconfig.json`, `vitest.config.ts`, `vitest.setup.ts`, `src/app/globals.css`, `src/app/layout.tsx`
**검증:** `npm run dev` → placeholder 페이지 표시 / `npm test` → 1 passed
**관련 결정:** D016 (디자인 토큰)

### Phase 2 — 도메인 / 데이터 레이어
**산출물:** zod schemas (common/personal/group/index) + 스텝 매핑 + 기본값. 한국 전화번호 validator. localStorage draft 래퍼. API 타입(Course/EnrollmentResponse/ErrorResponse) + ApiError 클래스 + fetcher.
**핵심 파일:** `src/app/(enroll)/_shared/schema/*.ts`, `_shared/api/*.ts`, `_shared/constants.ts`, `_shared/defaults.ts`, `src/lib/validators/phone.ts`, `src/lib/storage/enrollmentDraft.ts`, `src/lib/api/fetcher.ts`
**검증:** 모든 schema 단위 테스트 + storage 단위 테스트 통과
**관련 결정:** D003 (이메일 중복 refine), D006 (스토리지 정책), D011 (discriminated union)

### Phase 3 — Mock + Providers + UI 원자
**산출물:** MSW handlers (GET courses + POST enrollments) + 강의 mock 데이터(다양한 잔여석 케이스) + dev/test 셋업. Root providers (QueryClient/MSW boot/Toaster). UI 원자 6종 (Button/Input/Field/Modal/Stepper/Spinner).
**핵심 파일:** `src/lib/mocks/handlers.ts`, `mocks/browser.ts`, `mocks/server.ts`, `mocks/data/courses.ts`, `src/app/providers.tsx`, `src/components/ui/*.tsx`
**검증:** MSW 핸들러 스모크 테스트 통과, dev에서 fetch가 mock으로 가로채지는지 확인
**관련 결정:** D010 (MSW), D016 (UI 원자 LK 톤)

### Phase 4 — 폼 인프라
**산출물:** `(enroll)/layout.tsx`에 단일 useForm + FormProvider. StepIndicator. 훅 6종 (useStepNavigation/useDraftPersistence/useBeforeUnloadGuard/useTypeSwitchGuard/useSubmitEnrollment/useCourses). DraftRestoreGate, ErrorModal.
**핵심 파일:** `src/app/(enroll)/layout.tsx`, `_shared/hooks/*.ts`, `_shared/components/StepIndicator.tsx`, `_shared/components/DraftRestoreGate.tsx`, `review/_components/ErrorModal.tsx`
**검증:** 4개 placeholder 페이지로 라우팅, useStepNavigation 단위 테스트 통과, draft 복원 모달 동작
**관련 결정:** D001 (전환 가드), D005 (에러 분기), D006 (draft), D007 (인디케이터), D012 (FormProvider 위치), D013 (beforeunload)

### Phase 5 — 화면 구현
**산출물:** Step1View, Step2View(개인+단체), Step3View, Success.
- **5.1** Step 1 — CategoryFilter + CourseCard(3 상태) + CourseList + EnrollmentTypeSelect
- **5.2** Step 2 개인 — PersonalFields + 토글 + Step2View 컨테이너
- **5.3** Step 2 단체 — ParticipantsTable + BulkPasteModal + GroupFields + 전환 모달
- **5.4** Step 3 + Success — SummarySection + TermsCheckbox + 제출 wiring + Success/EnrollmentSummary

**핵심 파일:** `app/(enroll)/_components/`, `applicant/_components/`, `review/_components/`, `success/_components/`
**검증:** 풀 플로우(1→2→3→제출→success) dev에서 정상 동작. 단체 전환 + 참가자 테이블 + 일괄 입력 컴포넌트 테스트 통과.
**관련 결정:** D004 (정원 UX), D008 (참가자 입력)

### Phase 6 — 통합 테스트
**산출물:** MSW 통합 테스트 6 시나리오 — 성공 / `COURSE_FULL` / `DUPLICATE_ENROLLMENT` / `INVALID_INPUT` / 네트워크 / 연타 방지.
**핵심 파일:** `tests/integration/submission.test.tsx`, `tests/test-utils.tsx`
**검증:** 6 passed. `onUnhandledRequest: "error"` 설정으로 누락 fetch 즉시 발견.
**관련 결정:** D014 (테스트 전략)

### Phase 7 — 마무리 / 제출
**산출물:** 풀 플로우 + 에러 시나리오 시연. 키보드 Tab만으로 완주 검증. aria 속성 점검. `npm test && npm run build && npm run lint` 통과. README 작성.
**핵심 파일:** `README.md`
**검증:** GitHub public repo에서 `npm i && npm run dev` 즉시 실행 가능 확인 후 제출.

---

## 2. 5일 마일스톤

각 Day는 8시간(오전 4h + 오후 4h) 가정. 시간 빠듯하면 "선택 구현"부터 컷.

### Day 1 — 셋업 + 데이터 레이어
- **오전:** Phase 1 전체 (스캐폴드 + globals.css 토큰 + Pretendard + 스모크)
- **오후:** Phase 2 전체 (validator + 모든 schema + storage + API 타입/fetcher)
- **컷오프:** Day 1 종료 시 모든 zod 스키마 단위 테스트 + storage 테스트 + phone 테스트 통과
- **커밋:** `chore: 스캐폴드`, `feat(validators)`, `feat(schema:common)`, `feat(schema:personal)`, `feat(schema:group)`, `feat(schema:index)`, `feat(storage)`, `feat(api)`

### Day 2 — Mock + Providers + UI + 폼 인프라
- **오전:** Phase 3 전체 (MSW + Providers + UI 원자 6종)
- **오후:** Phase 4 시작 — `(enroll)/layout`, FormProvider, StepIndicator, useStepNavigation, useDraftPersistence + DraftRestoreGate
- **컷오프:** 4개 placeholder 페이지로 라우팅 확인. 빈 폼 상태로 새로고침 → draft 모달 안 뜸 확인.
- **커밋:** `feat(mocks)`, `feat(app:providers)`, `feat(ui)`, `feat(enroll:layout)`, `feat(enroll:hooks)`

### Day 3 — Step 1 + Step 2 개인
- **오전:** Phase 5.1 — useCourses + 1단계 컴포넌트들 + 통합. 강의 카드 3 상태(일반/마감임박/마감) 시각 확인.
- **오후:** Phase 5.2 — PersonalFields + Step2View + 토글 + useTypeSwitchGuard + TypeSwitchModal. 단체↔개인 전환 테스트 작성.
- **컷오프:** dev에서 1단계에서 강의 선택 + 개인 신청 → 2단계 진입 + 개인 정보 입력 → 다음 (3단계는 placeholder).
- **커밋:** `feat(course)`, `feat(applicant)`

### Day 4 — Step 2 단체 + Step 3 + Submit + Success
- **오전:** Phase 5.3 — ParticipantsTable + BulkPasteModal + GroupFields + 전환 모달. 참가자 동기화/CSV 파싱 컴포넌트 테스트.
- **오후:** Phase 5.4 — SummarySection + TermsCheckbox + Step3View + useSubmitEnrollment + ErrorModal + Success/EnrollmentSummary.
- **컷오프:** **풀 플로우 dev 동작.** course-001 선택 → 정보 입력 → 약관 → 제출 → success. course-FULL 선택 → 모달 → 1단계 복귀.
- **커밋:** `feat(group)`, `feat(review)`, `feat(submit)`

### Day 5 — 테스트 + 폴리싱 + 제출
- **오전 (3-4h):** Phase 6 — MSW 통합 테스트 6 시나리오. `npm test` 전체 그린.
- **오후 (3h):** Phase 7 — 키보드 플로우, aria 점검, 빌드/린트, README 작성.
- **마감 1h:** PR 정리, public repo 확인, `npm i && npm run dev` 실행 검증, 제출 메일.
- **컷오프:** `npm test && npm run build && npm run lint` 전부 통과. README 8 섹션 다 채움.
- **커밋:** `test(integration)`, `fix(a11y)`, `docs(readme)`

---

## 3. 우선순위 / 컷오프 룰

### Must (Day 4 종료까지 무조건)
- 명세 필수 구현 전체 (1·2·3단계 + 결과 화면 + 스텝 인디케이터 + 검증)
- D001/D003/D004/D005 4가지 변별 결정사항 모두 동작
- 모든 zod schema 단위 테스트 통과
- 풀 플로우 dev 동작

### Should (Day 5에 가산점 확보)
- MSW 통합 테스트 6 시나리오
- localStorage 임시 저장 + 복원 모달
- beforeunload 이탈 방지
- 참가자 일괄 입력 모달
- 키보드 네비 + aria 검증
- README 8 섹션 + AI 활용 범위 명시

### Nice (시간 남으면)
- BulkPasteModal 추가 검증 (탭/콤마 외 형식)
- 시각 회귀 (스토리북) — 사실상 안 함
- 추가 단위 테스트 커버리지

### 시간 부족 시 컷 순서 (위에서부터)
1. **Nice 항목 전부**
2. **BulkPasteModal** (D008-c에서 A안만 — 키보드 네비 유지)
3. **beforeunload** (선택 구현이라 README에 명시 가능)
4. **localStorage 임시 저장** (마찬가지 선택 구현)
5. **MSW 통합 테스트 6 → 4** (성공/`COURSE_FULL`/`DUPLICATE`/`INVALID_INPUT`만, 네트워크/연타 빼기)

**절대 컷하지 말 것:**
- D001/D003/D005 핵심 결정사항 동작
- 모든 zod 스키마 단위 테스트
- README (백지 제출은 평가 0점)
- public repo 실행 가능

---

## 4. 의존성 / 막히는 지점

각 Phase가 막히면 다음으로 못 넘어가는 지점이 있다. 사전 인지.

| 의존성 | 영향 | 해결 |
|---|---|---|
| Pretendard CDN 로드 | 한글 폰트 깨짐 → 시연 인상 나쁨 | 로컬 폴백 폰트 명시 |
| MSW Service Worker 등록 | dev에서 mock 안 함 → 실제 서버 호출 시도 → 화이트 스크린 | `public/mockServiceWorker.js` 자동 생성 명령 (`npx msw init public/`) 빼먹지 말 것 |
| zodResolver + RHF mode | "onBlur" 안 되면 평가 기준 직결 항목 빠짐 | useForm 옵션 검증 (Phase 4 첫날 끝나기 전에) |
| FormProvider 위치 | 라우트 전환 시 폼 상태 휘발 → 명세 위반 | `(enroll)/layout.tsx`에 두는 것 (D012) |
| useFieldArray + headCount 동기화 | 참가자 수와 row 수 어긋나면 superRefine 검증 실패 | `setValue("group.headCount", ...)` 호출 잊지 말 것 |
| TanStack Query mutations.retry: 0 | POST 자동 재시도되면 중복 신청 위험 | provider 셋업 시 명시 |

---

## 5. 참조 문서

| 문서 | 용도 |
|---|---|
| [`CLAUDE.md`](../CLAUDE.md) | 코드 규칙, 디자인 토큰, 폴더 구조, 커밋 규칙 |
| [`docs/decisions.md`](decisions.md) | D001~D016 — "왜 이렇게 했는가" 1차 소스 |
| [`docs/superpowers/specs/2026-04-27-multi-step-enrollment-form-design.md`](superpowers/specs/2026-04-27-multi-step-enrollment-form-design.md) | 통합 설계 스펙 — 아키텍처 한눈에 |
| [`docs/superpowers/plans/2026-04-27-multi-step-enrollment-form.md`](superpowers/plans/2026-04-27-multi-step-enrollment-form.md) | TDD 26-Task 디테일 (코드 + 테스트 모두 포함) |
| [`design.pen`](../design.pen) | Pencil 디자인 시안 — `theme: liveklass` 변형 = 구현 source of truth |
| [`design-references/`](../design-references) | 라이브클래스 사이트 스크린샷 (디자인 톤 추출 근거) |

---

## 6. 진행 트래킹

매일 종료 시 아래를 체크하고 다음날 시작:

**Day N 종료 시 자가 점검:**
- [ ] 오늘 컷오프 달성?
- [ ] 컷한 항목 있으면 README 「미구현」에 메모해뒀나?
- [ ] 커밋 히스토리가 의미 단위로 나뉘어 있나? (전체 dump 1개 커밋이면 평가 감점)
- [ ] 내일 첫 작업이 명확한가?

**막혔을 때 행동 순서:**
1. `docs/decisions.md` 해당 결정 ID 다시 읽기 (왜 이 방향이었는지 복기)
2. plan의 해당 Task 코드 확인
3. 그래도 안 되면 우선 컷 후 README 「미구현」에 솔직히 명시 + 대안 메모
4. 절대 시간 끌지 말 것 (Day 4 풀 플로우 컷오프가 가장 중요)
