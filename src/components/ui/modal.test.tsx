import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./modal";
import { Button } from "./button";

describe("Modal", () => {
  it("open=false 시 렌더 안 함", () => {
    render(
      <Modal open={false} onClose={() => {}} title="안내">
        본문
      </Modal>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("open=true 시 dialog + aria-modal + 제목 연결", () => {
    render(
      <Modal open onClose={() => {}} title="안내">
        본문
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    const title = screen.getByText("안내");
    expect(dialog.getAttribute("aria-labelledby")).toBe(title.id);
  });

  it("ESC 키로 onClose 호출", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="안내">
        <Button>확인</Button>
      </Modal>,
    );
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closeOnEsc=false 시 ESC 무시", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="안내" closeOnEsc={false}>
        본문
      </Modal>,
    );
    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("backdrop 클릭으로 닫기", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="안내">
        본문
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    const backdrop = dialog.parentElement!;
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("dialog 내부 클릭은 닫히지 않음", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="안내">
        본문
      </Modal>,
    );
    await user.click(screen.getByRole("dialog"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("description 있으면 aria-describedby 연결", () => {
    render(
      <Modal open onClose={() => {}} title="안내" description="설명입니다">
        본문
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    const desc = screen.getByText("설명입니다");
    expect(dialog.getAttribute("aria-describedby")).toBe(desc.id);
  });
});
