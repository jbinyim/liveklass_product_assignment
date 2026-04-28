import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorModal } from "./ErrorModal";
import { ApiError } from "@/lib/api/ApiError";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

beforeEach(() => {
  pushMock.mockClear();
});

describe("ErrorModal", () => {
  it("error=null이면 dialog 미표시", () => {
    render(<ErrorModal error={null} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  describe("COURSE_FULL", () => {
    const err = ApiError.business(
      { code: "COURSE_FULL", message: "정원" },
      409,
    );

    it("두 버튼 노출 + '강의 선택으로' 클릭 시 router.push('/') + onClose", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<ErrorModal error={err} onClose={onClose} />);
      await user.click(screen.getByRole("button", { name: "강의 선택으로" }));
      expect(pushMock).toHaveBeenCalledWith("/");
      expect(onClose).toHaveBeenCalled();
    });

    it("'닫기' 클릭 시 onClose만 호출", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<ErrorModal error={err} onClose={onClose} />);
      await user.click(screen.getByRole("button", { name: "닫기" }));
      expect(onClose).toHaveBeenCalled();
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  describe("DUPLICATE_ENROLLMENT", () => {
    it("'확인' 버튼 1개만 + 닫기", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const err = ApiError.business(
        { code: "DUPLICATE_ENROLLMENT", message: "중복" },
        409,
      );
      render(<ErrorModal error={err} onClose={onClose} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(1);
      await user.click(buttons[0]!);
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("network", () => {
    it("재시도 버튼이 onRetry 호출", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onRetry = vi.fn();
      const err = ApiError.network();
      render(<ErrorModal error={err} onClose={onClose} onRetry={onRetry} />);
      await user.click(screen.getByRole("button", { name: "재시도" }));
      expect(onRetry).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it("onRetry 없으면 재시도 버튼 미표시", () => {
      const err = ApiError.network();
      render(<ErrorModal error={err} onClose={() => {}} />);
      expect(
        screen.queryByRole("button", { name: "재시도" }),
      ).not.toBeInTheDocument();
    });
  });

  it("unknown 에러는 일반 메시지 표시", () => {
    const err = ApiError.unknown("서버 응답을 해석하지 못했습니다", 500);
    render(<ErrorModal error={err} onClose={() => {}} />);
    expect(screen.getByText("요청을 처리하지 못했어요")).toBeInTheDocument();
    expect(
      screen.getByText("서버 응답을 해석하지 못했습니다"),
    ).toBeInTheDocument();
  });
});
