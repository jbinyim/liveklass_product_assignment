# 라이브클래스 FE-A — 다단계 수강 신청 폼

## 프로젝트 개요
온라인 교육 플랫폼 수강 신청 흐름을 3단계 멀티스텝 폼으로 구현하는 프로덕트 엔지니어 채용 과제.
평가 초점: 폼 상태 관리, 조건부 필드(개인/단체) 데이터 정합성, 스텝별 유효성 검증, 에러 UX.

## 기술 스택
- Next.js 15 (App Router) + TypeScript (strict)
- react-hook-form + zod (폼/검증)
- TanStack Query (서버 상태)
- MSW (Mock API)
- Tailwind CSS
- Vitest + React Testing Library (테스트)
- 패키지 매니저: npm

## 폴더 구조 원칙 (콜로케이션)
- 각 페이지 전용 코드는 해당 페이지 폴더의 `_components/`에 둔다
- 라우트 그룹 `(enroll)/`로 멀티스텝 폼 묶음. 그룹 layout에 `FormProvider` 위치
- 페이지 간 공유 코드(schema, api, hooks, types)는 `(enroll)/_shared/`에 둔다
- `src/components/ui/` — 도메인 무관 재사용 UI (Button, Modal 등)
- `src/lib/` — fetch 래퍼, MSW handlers, 도메인 무관 유틸 (validators, storage)
- `_` prefix는 Next.js App Router의 private folder — 라우트 노출 안 됨
- 절대경로 import 사용: `@/app/(enroll)/_shared/...`, `@/lib/...`, `@/components/ui/...`

구조 예시:
```
src/
  app/
    layout.tsx                  # QueryProvider, MSW
    (enroll)/
      layout.tsx                # FormProvider, 스텝 가드
      _shared/                  # 페이지 간 공유
        schema/  api/  hooks/  types.ts
      page.tsx                  # 1단계
      _components/
      applicant/page.tsx        # 2단계
        _components/
      review/page.tsx           # 3단계
        _components/
      success/page.tsx          # 완료
        _components/
  components/ui/
  lib/
    api/  mocks/  storage/  validators/
```

## 코드 규칙
- `any` 금지. 개인/단체는 `type` 필드 기반 discriminated union으로 표현
  - 스키마 레벨에서 `z.discriminatedUnion("type", [...])` 사용
- zod 스키마는 `features/<domain>/schema/`에 분리 (UI와 분리)
- 서버 에러는 `ErrorResponse` 타입으로 받아 코드별 분기(`COURSE_FULL` / `DUPLICATE_ENROLLMENT` / `INVALID_INPUT`)
- 컴포넌트 `PascalCase`, 훅 `useX`, 상수 `SCREAMING_SNAKE`
- 주석은 WHY가 비자명할 때만. WHAT 설명 금지
- 기본값: 컴포넌트는 함수 선언 + named export. default export는 Next.js 페이지에서만

## 폼 원칙
- 스텝 간 데이터는 **단일 `useForm` + `FormProvider` 한 그루**로 공유 (확정)
- 유효성 검증: 스텝 전환 시 해당 스텝 schema로 `trigger()`, blur 시 개별 필드 검증
- 에러 발생 시 첫 에러 필드로 포커스 이동 + 스크롤
- 이전 스텝 이동 시 입력 데이터 유지 (rhf 기본 동작)

## 조건부 필드 데이터 정합성
- 개인↔단체 전환 시 반대편 전용 필드는 초기화. 입력값이 있는 상태에서 전환 시 확인 대화상자
- 참가자 명단 이메일 중복은 zod `refine`으로 검증 (참가자 간 중복 + 신청자 이메일과의 중복 모두)
- `headCount` 변경 시 `participants` 배열 길이 동기화
  - 증가: 빈 항목 추가
  - 감소: 뒤에서 제거 + 데이터 손실 시 경고

## 비동기 / 제출 UX
- 제출 버튼은 mutation `isPending` 동안 disabled (연타 방지)
- 네트워크 에러와 비즈니스 에러를 분리 처리
  - `COURSE_FULL` — 1단계 강의 선택으로 복귀 유도
  - `DUPLICATE_ENROLLMENT` — 안내 메시지 표시 (재시도 차단)
  - `INVALID_INPUT` — `details`를 RHF `setError`로 필드별 매핑, 첫 에러 필드로 포커스
  - 네트워크 에러 — 입력값 유지한 채 재시도 가능
- 강의 목록은 로딩 / 빈 상태 / 에러 상태 UI를 모두 명시적으로 제공
- 제출 실패 시 입력 데이터 유지 + 재시도 가능

## 정원 UX
- `currentEnrollment / maxCapacity` 기준 잔여석 표시
- 잔여 < 단체 신청 인원수일 때 1단계에서 차단 또는 경고

## 도메인 상수 / 경계값
- 이름: 2~20자
- 수강 동기: 0~300자 (선택)
- 단체 인원수: 2~10명
- 카테고리: `development` | `design` | `marketing` | `business`
- 전화번호: 한국 형식 (정규식은 `lib/validators/phone.ts`로 분리)

## 접근성 최소 기준
- 모든 input에 연결된 label
- 에러 메시지는 `aria-describedby`로 input과 연결, `role="alert"`
- 스텝 인디케이터는 `aria-current="step"`
- 키보드만으로 전체 플로우 완주 가능

## API / Mock
- 모든 fetch는 `src/lib/api/`의 클라이언트 경유
- Mock은 `src/lib/mocks/handlers.ts`에 정의, 개발/테스트에서 공용
- 비즈니스 에러 시나리오는 특정 `courseId`/입력으로 유발되도록 handler 구성

## 선택 구현 (할 것)
- localStorage 임시 저장: 스텝 1·2 입력값 보존, 제출 성공 시 클리어
- `beforeunload` 이탈 방지: form `dirty` 상태일 때만 활성화

## 선택 구현 (안 할 것)
- 모바일 전용 레이아웃 분기 (Tailwind 기본 반응형으로만 대응)

## 커밋 규칙
- Conventional Commits: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`
- scope는 도메인 기준: `feat(course): ...`, `feat(applicant): ...`, `feat(group): ...`, `feat(review): ...`, `feat(submit): ...`
- 한 커밋에 한 논리 단위. 전체 dump 금지
- 리팩토링/테스트 추가는 별도 커밋

## 테스트 정책
- 필수: zod 스키마 단위 테스트 (경계값, 조건부 필드, 이메일 중복)
- 필수: 스텝 전환/개인↔단체 전환 로직 테스트
- 필수: MSW로 제출 플로우 통합 테스트 (성공 / `COURSE_FULL` / `DUPLICATE_ENROLLMENT` / `INVALID_INPUT` 각 케이스)
- `npm test` 통과하지 않으면 커밋 금지

## 실행 명령
- `npm run dev` — 개발 서버 (MSW 자동 활성화)
- `npm test` — 테스트
- `npm run build` — 프로덕션 빌드
- `npm run lint` — ESLint

## 제출 요건
- public repo, `main` 브랜치 기준 `npm i && npm run dev`로 즉시 실행 가능
- README 필수 섹션:
  1. 프로젝트 개요
  2. 기술 스택
  3. 실행 방법
  4. 프로젝트 구조 설명
  5. 요구사항 해석 및 가정
  6. 설계 결정과 이유
  7. 미구현 / 제약사항
  8. AI 활용 범위

## 결정 기록 (`docs/decisions.md`)
- 명세가 비워둔 결정, 트레이드오프가 있는 선택, 구현 중 마주친 애매한 지점은 모두 `docs/decisions.md`에 기록한다
- 형식: `ID & 제목 / 상태 / 명세 근거 / 검토한 옵션 / 결정 / 이유`
  - 옵션은 최소 2개 이상 (대안 검토 흔적)
  - "명세 직접 인용" 부분은 그대로 옮겨 적기
  - 결정이 뒤집히면 기존 항목은 `폐기됨`으로 두고 새 ID로 추가
- 새로운 결정이 발생하면 즉시 추가 (회의록처럼 사후 정리하지 말 것)
- README 작성 시 「요구사항 해석 및 가정」 / 「설계 결정과 이유」의 1차 소스로 사용

## 작업 시 유의
- 디자인 자유 — 기능/UX/접근성에 집중
- UI 변경 시 브라우저에서 직접 확인 (타입체크만으로 완료 주장 금지)
