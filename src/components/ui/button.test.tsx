import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button", () => {
  it("children 렌더 + onClick 호출", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>다음</Button>);
    await user.click(screen.getByRole("button", { name: "다음" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("loading=true 시 disabled + Spinner 표시", () => {
    render(<Button loading>제출</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("disabled prop 단독으로도 비활성화", () => {
    render(<Button disabled>다음</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("loading 중에는 onClick 호출 안 됨", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        제출
      </Button>,
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("variant primary가 핫핑크 클래스를 가짐", () => {
    render(<Button>다음</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/--color-primary/);
  });
});
