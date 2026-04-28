"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { FormProvider, useForm, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  enrollmentSchema,
  type EnrollmentForm,
} from "@/app/(enroll)/_shared/schema";
import { enrollmentDefaults } from "@/app/(enroll)/_shared/defaults";
import { DraftRestoreGate } from "@/app/(enroll)/_shared/components/DraftRestoreGate";
import { StepIndicator } from "@/app/(enroll)/_shared/components/StepIndicator";

export default function EnrollLayout({ children }: { children: ReactNode }) {
  const methods = useForm<EnrollmentForm>({
    resolver: zodResolver(enrollmentSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: enrollmentDefaults as DefaultValues<EnrollmentForm>,
  });
  const pathname = usePathname() ?? "/";
  const isSuccess = pathname.startsWith("/success");

  return (
    <FormProvider {...methods}>
      <DraftRestoreGate>
        <div className="flex flex-1 flex-col">
          {!isSuccess && (
            <header className="mx-auto w-full max-w-3xl px-6 pt-8">
              <StepIndicator />
            </header>
          )}
          {children}
        </div>
      </DraftRestoreGate>
    </FormProvider>
  );
}
