import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
});
