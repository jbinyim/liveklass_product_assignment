import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse, delay } from "msw";
import { server } from "@/lib/mocks/server";
import {
  IntegratedApp,
  getRouterPath,
  resetRouter,
} from "../test-utils";

async function fillStep1(user: ReturnType<typeof userEvent.setup>) {
  // 일반 강의 (course-001) 선택
  await waitFor(() => screen.getByLabelText("강의 목록"));
  await user.click(
    screen.getByRole("button", { name: /프론트엔드 기초/ }),
  );
  await user.click(screen.getByRole("button", { name: /다음/ }));
  await waitFor(() => expect(getRouterPath()).toBe("/applicant"));
}

async function fillStep2Personal(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("홍길동"), "김민수");
  await user.type(
    screen.getByPlaceholderText("example@domain.com"),
    "user@example.com",
  );
  await user.type(
    screen.getByPlaceholderText("010-0000-0000"),
    "010-1234-5678",
  );
  await user.click(screen.getByRole("button", { name: /다음/ }));
  await waitFor(() => expect(getRouterPath()).toBe("/review"));
}

describe("submission integration", () => {
  beforeEach(() => {
    resetRouter();
    localStorage.clear();
  });

  it("성공: 1→2→3→제출→/success", async () => {
    const user = userEvent.setup();
    render(<IntegratedApp />);

    await fillStep1(user);
    await fillStep2Personal(user);

    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "제출하기" }));

    await waitFor(() =>
      expect(getRouterPath()).toMatch(/^\/success\?id=/),
    );
    expect(
      screen.getByText("신청이 완료되었습니다"),
    ).toBeInTheDocument();
    expect(screen.getByText(/^enr-/)).toBeInTheDocument();
  });

  it("COURSE_FULL: 모달 노출 + '강의 선택으로' 클릭 시 / 복귀 (D005-a)", async () => {
    const user = userEvent.setup();
    server.use(
      http.post("/api/enrollments", () =>
        HttpResponse.json(
          { code: "COURSE_FULL", message: "정원이 가득 찼습니다" },
          { status: 409 },
        ),
      ),
    );
    render(<IntegratedApp />);

    await fillStep1(user);
    await fillStep2Personal(user);
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "제출하기" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("정원이 가득 찼습니다")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "강의 선택으로" }));
    await waitFor(() => expect(getRouterPath()).toBe("/"));
    // 입력값은 유지 — Step 1로 복귀해도 다음 시도 가능
    expect(
      screen.getByRole("button", { name: /프론트엔드 기초/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("DUPLICATE_ENROLLMENT: 모달 + '확인' 닫기, 재시도 차단 (D005-b)", async () => {
    const user = userEvent.setup();
    server.use(
      http.post("/api/enrollments", () =>
        HttpResponse.json(
          { code: "DUPLICATE_ENROLLMENT", message: "이미 신청한 강의입니다" },
          { status: 409 },
        ),
      ),
    );
    render(<IntegratedApp />);

    await fillStep1(user);
    await fillStep2Personal(user);
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "제출하기" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("이미 신청한 강의예요")).toBeInTheDocument();
    // 버튼은 '확인' 1개만 (재시도 차단)
    const dialogButtons = screen
      .getByRole("dialog")
      .querySelectorAll("button");
    expect(dialogButtons).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "확인" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    // /review 그대로 유지
    expect(getRouterPath()).toBe("/review");
  });

  it("INVALID_INPUT: 첫 에러 스텝(/applicant)으로 자동 이동 + 인라인 에러 (D005-c)", async () => {
    const user = userEvent.setup();
    server.use(
      http.post("/api/enrollments", () =>
        HttpResponse.json(
          {
            code: "INVALID_INPUT",
            message: "입력값을 확인해주세요",
            details: {
              "applicant.email": "사용할 수 없는 이메일입니다",
            },
          },
          { status: 400 },
        ),
      ),
    );
    render(<IntegratedApp />);

    await fillStep1(user);
    await fillStep2Personal(user);
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "제출하기" }));

    // 자동 점프 — /applicant
    await waitFor(() => expect(getRouterPath()).toBe("/applicant"));
    // 인라인 에러 메시지 표시
    expect(
      await screen.findByText("사용할 수 없는 이메일입니다"),
    ).toBeInTheDocument();
  });

  it("네트워크 에러: 모달 + '재시도'로 동일 payload 재제출 (D005-d)", async () => {
    const user = userEvent.setup();
    let attempt = 0;
    server.use(
      http.post("/api/enrollments", async () => {
        attempt += 1;
        if (attempt === 1) return HttpResponse.error();
        return HttpResponse.json(
          {
            enrollmentId: "enr-retry",
            status: "confirmed",
            enrolledAt: "2026-04-28T00:00:00.000Z",
          },
          { status: 201 },
        );
      }),
    );
    render(<IntegratedApp />);

    await fillStep1(user);
    await fillStep2Personal(user);
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "제출하기" }));

    // 첫 시도: 네트워크 모달
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("네트워크 오류")).toBeInTheDocument();
    // 입력값 보존 — /review 그대로
    expect(getRouterPath()).toBe("/review");

    await user.click(screen.getByRole("button", { name: "재시도" }));
    // 두 번째 시도: 성공 → /success
    await waitFor(() =>
      expect(getRouterPath()).toMatch(/^\/success\?id=enr-retry/),
    );
    expect(attempt).toBe(2);
  });

  it("연타 방지: 제출 버튼은 mutation 진행 중 disabled", async () => {
    const user = userEvent.setup();
    const handler = vi.fn(async () => {
      await delay(200);
      return HttpResponse.json(
        {
          enrollmentId: "enr-once",
          status: "confirmed",
          enrolledAt: "2026-04-28T00:00:00.000Z",
        },
        { status: 201 },
      );
    });
    server.use(http.post("/api/enrollments", handler));
    render(<IntegratedApp />);

    await fillStep1(user);
    await fillStep2Personal(user);
    await user.click(screen.getByRole("checkbox"));

    const submitBtn = screen.getByRole("button", { name: "제출하기" });
    // 첫 클릭은 효과 — mutation 시작 → 버튼 disabled
    await user.click(submitBtn);
    // 즉시 disabled 확인
    expect(submitBtn).toBeDisabled();
    // 두 번째 클릭 시도 — 무시되어야
    await user.click(submitBtn);

    await waitFor(() =>
      expect(getRouterPath()).toMatch(/^\/success\?id=enr-once/),
    );
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
