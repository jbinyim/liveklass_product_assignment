import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge", () => {
  it("children 렌더", () => {
    render(<Badge>마감</Badge>);
    expect(screen.getByText("마감")).toBeInTheDocument();
  });

  it("variant low: 빨간 톤", () => {
    render(<Badge variant="low">마감임박 3석</Badge>);
    expect(screen.getByText("마감임박 3석").className).toMatch(
      /text-\[var\(--color-error\)\]/,
    );
  });

  it("variant full: 회색 톤", () => {
    render(<Badge variant="full">마감</Badge>);
    expect(screen.getByText("마감").className).toMatch(/surface-strong/);
  });
});
