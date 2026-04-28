import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApplicantFields } from "./ApplicantFields";
import { createFormWrapper } from "@/app/(enroll)/_shared/hooks/__test__/formWrapper";

describe("ApplicantFields", () => {
  it("4 필드 렌더 + 라벨 표시", () => {
    const { Wrapper } = createFormWrapper();
    render(
      <Wrapper>
        <ApplicantFields />
      </Wrapper>,
    );
    expect(screen.getByText("이름")).toBeInTheDocument();
    expect(screen.getByText("이메일")).toBeInTheDocument();
    expect(screen.getByText("전화번호")).toBeInTheDocument();
    expect(screen.getByText("수강 동기")).toBeInTheDocument();
  });

  it("이메일 형식 오류 시 blur로 alert 노출", async () => {
    const user = userEvent.setup();
    const { Wrapper } = createFormWrapper();
    render(
      <Wrapper>
        <ApplicantFields />
      </Wrapper>,
    );
    const email = screen.getByPlaceholderText("example@domain.com");
    await user.type(email, "not-email");
    await user.tab();
    expect(await screen.findByRole("alert")).toHaveTextContent(/이메일/);
  });

  it("이름 1자 → 2자 이상 에러", async () => {
    const user = userEvent.setup();
    const { Wrapper } = createFormWrapper();
    render(
      <Wrapper>
        <ApplicantFields />
      </Wrapper>,
    );
    const name = screen.getByPlaceholderText("홍길동");
    await user.type(name, "김");
    await user.tab();
    expect(await screen.findByRole("alert")).toHaveTextContent(/2자 이상/);
  });

  it("수강 동기 카운터 + maxLength", async () => {
    const user = userEvent.setup();
    const { Wrapper } = createFormWrapper();
    render(
      <Wrapper>
        <ApplicantFields />
      </Wrapper>,
    );
    expect(screen.getByText(/0\/300자/)).toBeInTheDocument();
    const motivation = screen.getByPlaceholderText(
      "수강 동기를 자유롭게 입력해주세요",
    ) as HTMLInputElement;
    await user.type(motivation, "테스트 동기");
    expect(screen.getByText(/6\/300자/)).toBeInTheDocument();
    expect(motivation.maxLength).toBe(300);
  });
});
