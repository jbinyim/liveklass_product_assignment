import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Stepper } from "./stepper";

function Harness({ initial = 5, min = 2, max = 10 }: { initial?: number; min?: number; max?: number }) {
  const [v, setV] = useState(initial);
  return <Stepper value={v} onChange={setV} min={min} max={max} aria-label="인원수" />;
}

describe("Stepper", () => {
  it("aria-label 노출", () => {
    render(<Harness />);
    expect(screen.getByLabelText("인원수")).toBeInTheDocument();
  });

  it("+ 버튼 클릭 시 값 증가", async () => {
    const user = userEvent.setup();
    render(<Harness initial={3} />);
    await user.click(screen.getByLabelText("증가"));
    expect(screen.getByLabelText("인원수")).toHaveValue(4);
  });

  it("− 버튼 클릭 시 값 감소", async () => {
    const user = userEvent.setup();
    render(<Harness initial={3} />);
    await user.click(screen.getByLabelText("감소"));
    expect(screen.getByLabelText("인원수")).toHaveValue(2);
  });

  it("min 도달 시 − 버튼 disabled", () => {
    render(<Harness initial={2} min={2} max={10} />);
    expect(screen.getByLabelText("감소")).toBeDisabled();
    expect(screen.getByLabelText("증가")).not.toBeDisabled();
  });

  it("max 도달 시 + 버튼 disabled", () => {
    render(<Harness initial={10} min={2} max={10} />);
    expect(screen.getByLabelText("증가")).toBeDisabled();
    expect(screen.getByLabelText("감소")).not.toBeDisabled();
  });

  it("직접 입력 시 max 초과는 clamp", () => {
    render(<Harness initial={3} min={2} max={10} />);
    const input = screen.getByLabelText("인원수");
    fireEvent.change(input, { target: { value: "99" } });
    expect(input).toHaveValue(10);
  });

  it("직접 입력 시 min 미만은 clamp", () => {
    render(<Harness initial={5} min={2} max={10} />);
    const input = screen.getByLabelText("인원수");
    fireEvent.change(input, { target: { value: "1" } });
    expect(input).toHaveValue(2);
  });

  it("controlled: onChange가 호출됨", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Stepper value={3} onChange={onChange} min={2} max={10} aria-label="x" />,
    );
    await user.click(screen.getByLabelText("증가"));
    expect(onChange).toHaveBeenCalledWith(4);
  });
});
