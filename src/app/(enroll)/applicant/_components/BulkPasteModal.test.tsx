import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BulkPasteModal } from "./BulkPasteModal";

describe("BulkPasteModal", () => {
  it("open=false 시 미표시", () => {
    render(<BulkPasteModal open={false} onClose={() => {}} onApply={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("콤마 구분 파싱 + OK 상태", async () => {
    const user = userEvent.setup();
    render(<BulkPasteModal open onClose={() => {}} onApply={() => {}} />);
    const ta = screen.getByLabelText("참가자 일괄 붙여넣기");
    await user.type(ta, "김민수,min@example.com");
    expect(screen.getByText("김민수")).toBeInTheDocument();
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("탭 구분도 허용", async () => {
    const user = userEvent.setup();
    render(<BulkPasteModal open onClose={() => {}} onApply={() => {}} />);
    const ta = screen.getByLabelText("참가자 일괄 붙여넣기");
    await user.type(ta, "이지영\tj@example.com");
    expect(screen.getByText("이지영")).toBeInTheDocument();
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("형식 오류 행은 빨간색 + 에러 라벨", async () => {
    const user = userEvent.setup();
    render(<BulkPasteModal open onClose={() => {}} onApply={() => {}} />);
    const ta = screen.getByLabelText("참가자 일괄 붙여넣기");
    await user.type(ta, "김,not-email");
    expect(screen.getByText("형식 오류")).toBeInTheDocument();
  });

  it("적용 버튼이 valid rows만 onApply에 전달", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(<BulkPasteModal open onClose={() => {}} onApply={onApply} />);
    const ta = screen.getByLabelText("참가자 일괄 붙여넣기");
    await user.type(ta, "김민수,min@example.com{Enter}이지영,j@example.com");
    await user.click(screen.getByRole("button", { name: /명 적용/ }));
    expect(onApply).toHaveBeenCalledWith([
      { name: "김민수", email: "min@example.com" },
      { name: "이지영", email: "j@example.com" },
    ]);
  });

  it("최대 인원 초과 시 경고 + truncate", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(<BulkPasteModal open onClose={() => {}} onApply={onApply} />);
    const ta = screen.getByLabelText("참가자 일괄 붙여넣기");
    const lines = Array.from(
      { length: 11 },
      (_, i) => `사람${i + 1},p${i + 1}@example.com`,
    ).join("\n");
    await user.type(ta, lines);
    expect(screen.getByRole("alert")).toHaveTextContent(/10명/);
    await user.click(screen.getByRole("button", { name: /10명 적용/ }));
    expect(onApply.mock.calls[0]?.[0]).toHaveLength(10);
  });
});
