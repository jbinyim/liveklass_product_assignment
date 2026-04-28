# 라이브클래스 수강 신청 — 다단계 폼

3단계 멀티스텝 수강 신청 폼. 평가 초점은 **폼 상태 관리 / 조건부 필드 정합성 / 스텝별 검증 / 에러 UX** 네 가지이며, 명세가 비워둔 결정과 트레이드오프는 [`docs/decisions.md`](docs/decisions.md)의 D001~D015에 1차 소스로 정리해 두었습니다.

플로우: **강의 선택 → 신청자 정보 → 확인 및 제출 → 완료**

```
/                    1단계 강의 선택 + 신청 유형(개인/단체)
/applicant           2단계 공통 정보 + (단체 시) 단체 정보·참가자 명단
/review              3단계 요약 + 약관 동의 + 제출
/success?id=enr-XXXX 완료
```

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [실행 방법](#3-실행-방법)
4. [프로젝트 구조](#4-프로젝트-구조)
5. [요구사항 해석 및 가정](#5-요구사항-해석-및-가정)
6. [설계 결정과 이유](#6-설계-결정과-이유)
7. [미구현 / 제약사항](#7-미구현--제약사항)
8. [AI 활용 범위](#8-ai-활용-범위)

---

## 1. 프로젝트 개요

수강 신청 흐름을 3단계로 나누고, 단계별 검증·뒤로가기 시 입력 유지·서버 에러별 다른 UX·임시 저장·이탈 방지까지 갖춘 폼 구현.

총 55 커밋, 228 테스트(단위 + 컴포넌트 + MSW 통합 6 시나리오), `npm run lint`/`npm run build` 모두 무경고. 모든 fetch는 MSW로 가로채는 가짜 백엔드를 통해 동작하므로 별도 서버 없이 `npm i && npm run dev` 만으로 즉시 실행됩니다.

---

## 2. 기술 스택

| 영역 | 도구 | 비고 |
|---|---|---|
| 프레임워크 | Next.js 15 (App Router) + React 18 | TypeScript strict + `noUncheckedIndexedAccess` |
| 스타일 | Tailwind CSS v4 | CSS-first `@theme inline` 토큰 매핑 |
| 폰트 | Pretendard (CDN) | system 폴백 |
| 폼 | react-hook-form + zod | `z.discriminatedUnion("type", [...])` |
| 검증 연결 | @hookform/resolvers | `zodResolver` |
| 서버 상태 | TanStack Query | `mutations.retry: 0`, `queries.retry: 1`, `staleTime: 60s` |
| 모킹 | MSW (msw 2.x) | dev=Service Worker / test=msw/node |
| 테스트 | Vitest + React Testing Library | jsdom + `@testing-library/jest-dom` |
| 패키지 매니저 | npm | |

---

## 3. 실행 방법

### 사전 요구
- Node.js 20+
- npm 10+

### 명령어

```bash
npm i            # 의존성 설치 (mockServiceWorker.js는 이미 public/에 포함)
npm run dev      # 개발 서버 (http://localhost:3000)
npm test         # 단위 + 통합 테스트 (Vitest)
npm run build    # 프로덕션 빌드 검증
npm run lint     # ESLint
```

### 동작 확인

`npm run dev` 후 브라우저 콘솔에 다음이 보이면 MSW 가 활성화된 상태입니다.

```
[MSW] Mocking enabled.
```

---

## 4. 프로젝트 구조

```
src/
  app/
    layout.tsx                          # QueryProvider + MSW boot + Pretendard
    providers.tsx                       # QueryClient 단일 인스턴스 + MswBootstrap
    globals.css                         # 디자인 토큰 (D016) + Tailwind v4 @theme
    page.tsx                            # 1단계는 (enroll)/page.tsx가 / 차지
    (enroll)/                           # 라우트 그룹 — 1·2·3단계 + success 묶음
      layout.tsx                        # 단일 useForm + FormProvider + StepIndicator + DraftRestoreGate
      _shared/                          # 페이지 간 공유
        api/                            # 도메인 API 함수 (getCourses / submitEnrollment) + types
        components/                     # StepIndicator, DraftRestoreGate
        hooks/                          # 6 커스텀 훅 (useStepNavigation 등)
        schema/                         # zod 스키마 (common / personal / group / index / step)
        constants.ts                    # 도메인 경계값
        defaults.ts                     # RHF 초기값
        types.ts
      page.tsx                          # 1단계 강의 선택
        _components/                    # 1단계 전용 (CourseCard / CategoryFilter / EnrollmentTypeSelect / Step1View)
      applicant/page.tsx                # 2단계
        _components/                    # 2단계 전용 (ApplicantFields / GroupFields / ParticipantsTable / BulkPasteModal / TypeSwitchToggle / Step2View)
      review/page.tsx                   # 3단계
        _components/                    # 3단계 전용 (SummarySection / TermsCheckbox / ErrorModal / Step3View)
      success/page.tsx                  # 완료
        _components/                    # EnrollmentSummary
  components/ui/                        # 도메인 무관 UI 원자 (Button / Input / Field / Modal / Stepper / Spinner / Badge)
  lib/
    api/                                # fetcher + ApiError (도메인 무관)
    mocks/                              # MSW handlers + browser/server bootstrap + mock 데이터
    storage/                            # enrollmentDraft 래퍼 (D006)
    validators/                         # 한국 전화번호 정규식
tests/
  test-utils.tsx                        # 통합 테스트용 Integrated 래퍼 (mock router)
  integration/submission.test.tsx       # 6 시나리오 (D014)
docs/
  decisions.md                          # D001~D015 결정 기록
  roadmap.md                            # 5일 마일스톤
  superpowers/specs/                    # 통합 설계 스펙 (1차 자료)
```

### 콜로케이션 원칙
- **각 페이지 전용 코드는 그 페이지의 `_components/`** 에 둔다 (다른 페이지가 import 안 함)
- **페이지 간 공유는 `(enroll)/_shared/`** (스키마/훅/도메인 API/도메인 컴포넌트)
- **`src/components/ui/`** — 도메인 무관 빌딩블록 (Button/Input/Modal 등)
- **`src/lib/`** — 도메인 무관 인프라 (fetcher / ApiError / storage / validators / mocks)
- `_` 접두는 Next.js App Router의 private folder — 라우트로 노출되지 않음

### 상태 4 레이어 분리 (D011)

| 종류 | 도구 | 위치 |
|---|---|---|
| 폼 입력값 | RHF | `(enroll)/layout.tsx`의 단일 `FormProvider` |
| 서버 데이터 | TanStack Query | 루트 `QueryClientProvider` |
| 일시 UI 상태 | `useState` | 컴포넌트 내부 (모달 open 등) |
| 영속 상태 | localStorage 래퍼 | `lib/storage/enrollmentDraft` |

---

## 5. 요구사항 해석 및 가정

명세가 비워둔 부분에 대한 본인 해석. 각 항목은 [`docs/decisions.md`](docs/decisions.md)에 옵션 검토 + 결정 + 이유로 1차 소스가 있습니다.

### 신청자(applicant) ≠ 참가자(participants) — D002

API 모델이 `applicant`와 `group.participants`를 별도 필드로 분리한 시점에서 **역할이 분리된 설계**로 해석.
- 신청자: 행정 주체 (폼 작성·연락 받는 사람)
- 참가자: 수강 주체 (실제 강의 듣는 사람)

이메일 동일 시 데이터 모순 → D003의 중복 검증 정책으로 이어짐. 자세한 옵션 비교는 [decisions.md#d002](docs/decisions.md#d002-신청자applicant와-참가자participants-역할-해석).

### 정원 거의 찬 강의 UX — D004

명세 1) "정원이 거의 찬 강의를 선택했을 때 UX를 어떻게 처리하는가"에 대한 답.

- **D004-a 잔여석 표시**: `잔여 ≤ SEATS_LOW_THRESHOLD(5)` 일 때 빨간 "마감임박 N석" 배지. 평소엔 잔여석 숫자 노출 안 함 (시각 피로 회피).
- **D004-b 정원 마감 강의**: 회색 처리 + "마감" 배지 + 클릭 차단. 목록에서 숨기지 않음 (컨텍스트 유지).
- **D004-c 단체 인원수 > 잔여석**: 클라이언트 즉시 검증 + 서버 최종 검증 양쪽. 클라는 즉시 피드백, 서버는 동시성 권위. 면접 질문 4번 답변 거리.

상세: [decisions.md#d004](docs/decisions.md#d004-정원-거의-찬-강의-ux).

### 참가자 명단 이메일 중복 — D003

명세 1)의 "특히 봐야 할 애매한 지점들"의 한 항목.

- 검증 범위: **참가자 간 중복 + 신청자↔참가자 중복** (담당자는 단순 문자열이라 검증 대상 외)
- 검증 시점: blur (명세 「유효성 검증 시점」 높은 숙련도 기준)
- 구현: `groupEnrollmentSchema.superRefine`에서 `.trim().toLowerCase()` 정규화 후 비교 (`schema/group.ts`)
- 중복 발견 시 path = `["group", "participants", i, "email"]` 으로 RHF에 매핑 → ParticipantsTable이 해당 행에 인라인 에러 표시

상세: [decisions.md#d003](docs/decisions.md#d003-참가자-명단-이메일-중복-검증-범위).

### 한국 전화번호 형식

명세에 정확한 정의가 없어 다음 정책으로 결정:

```
입력 정규화: replace(/[\s-]/g, "")        # 공백/하이픈 제거
매칭 패턴(정규화 후):
  모바일  01[016789]\d{7,8}              # 010~019 + 7~8자리
  서울    02\d{7,8}                      # 02 + 7~8자리
  지역    0[3-9]\d\d{6,8}                # 0XX + 6~8자리
```

`+82-…` 같은 국제 표기는 미지원 (`lib/validators/phone.ts`).

### 그 외 가정

- **단체 인원수 2~10명** (명세 명시)
- **이름 2~20자** (명세 명시)
- **수강 동기 0~300자, 선택 입력**
- **카테고리 4종**: development / design / marketing / business
- **카드 라운드 20px / 버튼 라운드 30px(pill) / 입력 8px** — 디자인 시안(`design.pen`의 `theme: liveklass`)에서 추출 (D016)

---

## 6. 설계 결정과 이유

### 핵심 결정 요약 (표)

| ID | 영역 | 결정 | 핵심 이유 |
|---|---|---|---|
| [D001](docs/decisions.md#d001-개인단체-전환-시-데이터-처리-정책) | 개인↔단체 전환 | 입력값 있을 때만 확인 모달 + 초기화 | 빈 상태 모달 잡음 회피 + 데이터 정합성 |
| [D003](docs/decisions.md#d003-참가자-명단-이메일-중복-검증-범위) | 이메일 중복 검증 | 참가자 간 + 신청자↔참가자 (blur 시점) | D002 역할 분리의 자연스러운 귀결 |
| [D005](docs/decisions.md#d005-에러-시나리오별-복구-ux) | 에러 시나리오 4종 | COURSE_FULL/DUPLICATE/INVALID/네트워크 모두 다른 UX | 비즈니스 vs 네트워크 구분, 면접 질문 3번 답 |
| [D006](docs/decisions.md#d006-임시-저장localstorage-정책) | localStorage | 24h TTL + agreedToTerms 제외 | 약관은 매번 의도 행위 |
| [D007](docs/decisions.md#d007-스텝-인디케이터-동작) | 스텝 점프 정책 | 이전 완료 스텝만 점프, 미래 스텝 잠금 | 빈 데이터 미래 스텝 진입 방지 |
| [D011](docs/decisions.md#d011-상태-레이어-분리--rhf--query--usestate--storage) | 상태 4레이어 | RHF / Query / useState / localStorage 명확 분리 | 책임 명확, 디버깅 단순 |
| [D012](docs/decisions.md#d012-단일-useform-위치--enrolllayouttsx) | FormProvider 위치 | `(enroll)/layout.tsx` | 신청 흐름 안에서만 활성, success는 외부 |
| [D013](docs/decisions.md#d013-이탈-방지beforeunload-활성화-조건) | beforeunload | `isDirty && !isSubmitSuccessful` | 빈 폼 잡음 + 제출 후 자동 해제 |
| [D014](docs/decisions.md#d014-테스트-전략--피라미드--결정사항별-의무-커버) | 테스트 전략 | 결정사항별 의무 커버 (수치 X) | 의미 있는 테스트만 |

### 결정의 깊이 — 4가지 사례

#### D005 에러 분기별 UX

같은 4xx라도 사용자 행동에 따라 다른 응답이 의미 있어, 시나리오별로 다른 UX:

- **`COURSE_FULL`** → 모달 + "강의 선택으로 / 닫기" 두 버튼 (사용자 주도권 보존, 자동 이동은 입력값이 날아간 인상)
- **`DUPLICATE_ENROLLMENT`** → 모달 + "확인" 1버튼 (재시도가 의미 없는 에러, 메시지만 명확히)
- **`INVALID_INPUT`** → 모달 없이 `details`를 RHF `setError`로 매핑 → **첫 에러 스텝으로 자동 점프 + 포커스** (즉시성)
- **네트워크 에러** → 모달 + "재시도 / 닫기" (입력값 보존, 동일 payload 재제출)

`mutations.retry: 0`을 강제하는 이유도 여기서 옵니다 — POST는 멱등하지 않으니 자동 재시도는 중복 신청 위험.

#### D012 FormProvider를 (enroll)/layout.tsx에 둔 이유

세 가지 선택지를 비교했습니다:

- 루트 `app/layout.tsx`에 FormProvider → success/에러 페이지에서도 컨텍스트 살아있음 → 의도치 않은 의존
- 페이지 단위로 FormProvider → 페이지 전환 시 폼 상태 휘발 → 명세의 "이전 단계 돌아갈 때 데이터 유지" 위반
- **(enroll)/layout.tsx** ✅ → 1·2·3단계의 공통 부모이면서 success는 의도적으로 외부 → 컨텍스트 경계가 도메인 경계와 일치

라우트 그룹 `(enroll)/` 자체가 "신청 흐름"의 의미적 단위라, FormProvider 위치도 그 경계에 두는 게 자연스럽습니다.

#### D006 localStorage 정책

- **키**: `livclass:enrollment-draft:v1` (네임스페이스 + 버전)
- **저장 시점**: RHF watch + debounce 500ms — 새로고침 시 직전 입력까지 보존
- **복원**: "이전 입력값 복구하시겠어요?" 모달 → 사용자 명시적 동의 (자동 복원은 위험)
- **폐기 시점**:
  - 제출 성공 시 즉시
  - 복원 모달에서 "폐기" 선택
  - TTL 24h 초과 시 자동
- **저장 범위**: `agreedToTerms` 제외, 그 외 모든 필드 — 약관은 매번 의도적으로 받는 행위

운영 환경에선 민감 필드(전화/이메일) 마스킹 또는 서버 임시 저장 API로 대체가 필요합니다.

#### D014 테스트 전략

수치 커버리지(80% 등)는 의미 없는 테스트를 늘릴 위험이 있어 채택하지 않고, **결정사항별 의무 커버**로 갔습니다.

| 커버 대상 | 테스트 종류 | 위치 |
|---|---|---|
| 모든 zod 스키마 (경계값/조건부) | 단위 | `_shared/schema/*.test.ts` |
| D001 개인↔단체 전환 | 컴포넌트 | `useTypeSwitchGuard.test.tsx`, `EnrollmentTypeSelect.test.tsx` |
| D003 이메일 중복 | 스키마 + 컴포넌트 | `group.test.ts`, `ParticipantsTable.test.tsx` |
| D005 4가지 에러 분기 | MSW 통합 | `tests/integration/submission.test.tsx` |
| D006 localStorage | 단위 | `enrollmentDraft.test.ts` |
| D007 스텝 점프 정책 | 훅 | `useStepNavigation.test.tsx` |
| D008 참가자 입력 / 일괄 입력 | 컴포넌트 | `BulkPasteModal.test.tsx`, `GroupFields.test.tsx` |
| D013 beforeunload | 훅 | `useBeforeUnloadGuard.test.tsx` |

총 228 테스트, 단위 → 컴포넌트 → 통합 피라미드 구조. E2E는 과제 범위 외로 미도입 — 통합 테스트 6 시나리오로 풀 플로우 커버.

---

## 7. 미구현 / 제약사항

### 의도적 미도입

- **모바일 전용 레이아웃 분기 없음** — Tailwind 기본 반응형으로 대응
- **E2E (Playwright/Cypress) 미도입** — 과제 범위 외, MSW 통합 테스트 6 시나리오로 대체
- **시각적 회귀 테스트(스토리북/Chromatic) 미도입** — 도입 비용 대비 가산 약함
- **인증/인가/결제 미구현** — 명세 명시
- **백엔드 미구현** — MSW로 대체. 진짜 백엔드 교체 시 `worker.start()` 가드만 끄면 됨

### 한계 / 추후 보강 후보

- **localStorage 전 필드 저장** — 운영 환경에선 민감 정보(전화/이메일) 마스킹 또는 서버 임시 저장 API로 대체 필요 (D006-e)
- **BulkPasteModal 형식** — 콤마/탭 구분만 지원. 스프레드시트 정확 매칭 등은 미지원
- **/success 페이지의 Step Indicator** — 현재 `PATH_TO_STEP` 매핑에 `/success`가 없어 fallback으로 ① 강의 선택이 핫핑크로 표시됨. success 화면에선 인디케이터를 비표시하거나 모두 완료(분홍 tint)로 보이는 게 자연스러우나 미수정.
- **Step 2 헤더의 segmented toggle** — "신청 정보 입력" 타이틀과 우측 토글의 시각 정렬이 디자인적으로 다듬을 여지
- **개인 모드의 group 필드** — discriminated union 정합성 위해 `unregister` 대신 빈값 reset 사용. 직렬화 시 폼 페이로드에 빈 group 블록이 포함됨 (서버는 type 기반으로 무시)

---

## 8. AI 활용 범위

본 과제는 Anthropic의 **Claude Code** (Opus 4.7) 를 페어 프로그래밍 파트너처럼 활용했습니다. 디자인 시안 추출엔 **Pencil MCP** 를 사용했습니다.

### 활용한 영역

- 명세 해석 단계에서 옵션 비교(D001~D015의 트레이드오프)를 정리하고, 채택은 검토 후 본인이 결정해 [`docs/decisions.md`](docs/decisions.md)에 기록했습니다.
- Phase별 plan 파일을 미리 작성한 뒤 검토·승인하는 흐름으로 진행했습니다.
- 함수·컴포넌트·테스트 케이스의 1차 작성은 AI 도움을 받았고, 모든 산출물은 본인이 검토·수정·승인한 뒤 커밋했습니다.
- `design.pen` 시안은 Pencil MCP로 LK theme 토큰(색·라운드·padding·간격)을 추출해 `globals.css`와 컴포넌트에 매핑했습니다.

### 활용 중 발견한 한계

AI 산출물을 그대로 받지 않고 검토하면서 발견·수정한 함정입니다.

- **`useFieldArray` 다중 인스턴스 동기화 실패** ([7340294](https://github.com/jbinyim/liveklass_product_assignment/commit/7340294)): `GroupFields`와 `ParticipantsTable`이 각자 `useFieldArray("group.participants")` 를 호출해서 `replace()` 결과가 다른 인스턴스의 `fields`에 반영되지 않았습니다. dev에서 단체 토글 시 참가자 행이 안 보이는 증상으로 발견했고, `ParticipantsTable`을 `useWatch` 기반으로 바꾸고 마운트 시 `useEffect`로 동기화를 거는 방식으로 수정했습니다.
- **RHF `formState.errors` 추적 실패**: `const { formState: { errors } } = useFormContext()` 로 destructure하면 RHF proxy가 변경을 추적하지 못해, `useFormState({ control })` 로 명시 구독해야 한다는 사실을 `ParticipantsTable`에서 trigger 후 인라인 에러가 안 나오는 증상으로 알게 됐습니다.
- **zod 4 `discriminatedUnion + superRefine` 단락 평가**: union 멤버의 일반 필드(예: `agreedToTerms: z.literal(true)`)가 실패하면 superRefine이 실행되지 않습니다. 테스트에서 `agreedToTerms: true`를 명시해야 D003 검증이 동작했습니다.
- **Tailwind v4 `@theme inline`**: 초기 plan에는 `tailwind.config.ts`로 토큰을 둔다고 적었지만 v4 스캐폴드는 CSS-first 방식입니다. globals.css의 `@theme` 블록에 토큰을 매핑하는 쪽으로 전환했습니다.
- **Next.js route group과 URL**: `(enroll)/page.tsx`는 `/enroll`이 아닌 `/`를 차지합니다. 첫 빌드에서 라우트 매핑을 확인하고 `/applicant`, `/review`, `/success`로 path를 정정했습니다.

산출물의 결정과 책임은 모두 본인에게 있고, [`docs/decisions.md`](docs/decisions.md)와 README에 근거를 1차 소스로 남겨 면접 자리에서 동일한 흐름으로 설명할 수 있도록 정리해 두었습니다.

---

## 부록

- 변경 결정 기록: [`docs/decisions.md`](docs/decisions.md) — D001~D015
- 5일 마일스톤 / Phase별 컷오프: [`docs/roadmap.md`](docs/roadmap.md)
- 통합 설계 스펙 (1차 자료): [`docs/superpowers/specs/2026-04-27-multi-step-enrollment-form-design.md`](docs/superpowers/specs/2026-04-27-multi-step-enrollment-form-design.md)
