"use client";

import type { ReactNode } from "react";
import { FormProvider, useForm, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  enrollmentSchema,
  type EnrollmentForm,
} from "@/app/(enroll)/_shared/schema";
import { enrollmentDefaults } from "@/app/(enroll)/_shared/defaults";

export default function EnrollLayout({ children }: { children: ReactNode }) {
  const methods = useForm<EnrollmentForm>({
    resolver: zodResolver(enrollmentSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: enrollmentDefaults as DefaultValues<EnrollmentForm>,
  });

  return (
    <FormProvider {...methods}>
      <div className="flex flex-1 flex-col">{children}</div>
    </FormProvider>
  );
}
