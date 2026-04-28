import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "./input";

describe("Input", () => {
  it("placeholder 노출", () => {
    render(<Input placeholder="이름을 입력하세요" />);
    expect(screen.getByPlaceholderText("이름을 입력하세요")).toBeInTheDocument();
  });

  it("invalid=true 시 aria-invalid='true'", () => {
    render(<Input invalid placeholder="x" />);
    expect(screen.getByPlaceholderText("x")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("invalid=false 시 aria-invalid 미설정", () => {
    render(<Input placeholder="x" />);
    expect(screen.getByPlaceholderText("x")).not.toHaveAttribute("aria-invalid");
  });

  it("disabled 동작", () => {
    render(<Input disabled placeholder="x" />);
    expect(screen.getByPlaceholderText("x")).toBeDisabled();
  });
});
