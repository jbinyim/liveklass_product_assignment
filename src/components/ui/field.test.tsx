import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Field } from "./field";
import { Input } from "./input";

describe("Field", () => {
  it("label-input id 자동 매칭 (htmlFor)", () => {
    render(
      <Field label="이름">
        <Input placeholder="홍길동" />
      </Field>,
    );
    const input = screen.getByPlaceholderText("홍길동");
    const label = screen.getByText("이름");
    expect(label.tagName).toBe("LABEL");
    expect(input.id).toBe(label.getAttribute("for"));
  });

  it("required=true 시 별표 표시", () => {
    render(
      <Field label="이름" required>
        <Input placeholder="x" />
      </Field>,
    );
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("error 메시지 role='alert' + aria-describedby 연결", () => {
    render(
      <Field label="이메일" error="형식 오류">
        <Input placeholder="x" />
      </Field>,
    );
    const input = screen.getByPlaceholderText("x");
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("형식 오류");
    expect(input.getAttribute("aria-describedby")?.split(" ")).toContain(
      alert.id,
    );
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("hint는 error 있으면 숨김", () => {
    render(
      <Field label="이메일" hint="회사 이메일 권장" error="형식 오류">
        <Input placeholder="x" />
      </Field>,
    );
    expect(screen.queryByText("회사 이메일 권장")).not.toBeInTheDocument();
  });

  it("hint만 있고 error 없으면 표시", () => {
    render(
      <Field label="이메일" hint="회사 이메일 권장">
        <Input placeholder="x" />
      </Field>,
    );
    expect(screen.getByText("회사 이메일 권장")).toBeInTheDocument();
  });
});
