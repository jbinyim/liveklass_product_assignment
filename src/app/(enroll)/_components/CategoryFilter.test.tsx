import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoryFilter } from "./CategoryFilter";

describe("CategoryFilter", () => {
  it("전체 + 4 카테고리 = 5 탭", () => {
    render(<CategoryFilter value="all" onChange={() => {}} />);
    expect(screen.getAllByRole("tab")).toHaveLength(5);
    expect(screen.getByText("전체")).toBeInTheDocument();
    expect(screen.getByText("개발")).toBeInTheDocument();
    expect(screen.getByText("디자인")).toBeInTheDocument();
    expect(screen.getByText("마케팅")).toBeInTheDocument();
    expect(screen.getByText("비즈니스")).toBeInTheDocument();
  });

  it("active 탭에 aria-selected='true'", () => {
    render(<CategoryFilter value="design" onChange={() => {}} />);
    expect(screen.getByText("디자인")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("전체")).toHaveAttribute("aria-selected", "false");
  });

  it("탭 클릭 시 onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CategoryFilter value="all" onChange={onChange} />);
    await user.click(screen.getByText("마케팅"));
    expect(onChange).toHaveBeenCalledWith("marketing");
  });
});
