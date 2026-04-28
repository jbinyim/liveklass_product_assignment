import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useFormContext } from "react-hook-form";
import { TermsCheckbox } from "./TermsCheckbox";
import { createFormWrapper } from "@/app/(enroll)/_shared/hooks/__test__/formWrapper";
import type { EnrollmentForm } from "@/app/(enroll)/_shared/schema";

function CheckSpy() {
  const { watch } = useFormContext<EnrollmentForm>();
  return <span data-testid="spy">{String(watch("agreedToTerms"))}</span>;
}

describe("TermsCheckbox", () => {
  it("기본 미동의 + 클릭 시 토글", async () => {
    const user = userEvent.setup();
    const { Wrapper } = createFormWrapper();
    render(
      <Wrapper>
        <TermsCheckbox />
        <CheckSpy />
      </Wrapper>,
    );
    expect(screen.getByText("미동의")).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox"));
    expect(screen.getByText("동의함")).toBeInTheDocument();
  });

  it("(필수) 라벨 노출", () => {
    const { Wrapper } = createFormWrapper();
    render(
      <Wrapper>
        <TermsCheckbox />
      </Wrapper>,
    );
    expect(screen.getByText("(필수)")).toBeInTheDocument();
  });
});
