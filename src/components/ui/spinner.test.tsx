import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "./spinner";

describe("Spinner", () => {
  it("기본 aria-label 노출", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "로딩 중",
    );
  });

  it("커스텀 aria-label", () => {
    render(<Spinner aria-label="강의 불러오는 중" />);
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "강의 불러오는 중",
    );
  });
});
