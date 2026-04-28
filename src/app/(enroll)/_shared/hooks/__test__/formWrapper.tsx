import { FormProvider, useForm, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import {
  enrollmentSchema,
  type EnrollmentForm,
} from "@/app/(enroll)/_shared/schema";
import { enrollmentDefaults } from "@/app/(enroll)/_shared/defaults";

export function createFormWrapper(
  initial?: Partial<EnrollmentForm>,
) {
  let methodsRef: ReturnType<typeof useForm<EnrollmentForm>> | null = null;

  function Wrapper({ children }: { children: ReactNode }) {
    const methods = useForm<EnrollmentForm>({
      resolver: zodResolver(enrollmentSchema),
      mode: "onBlur",
      defaultValues: {
        ...enrollmentDefaults,
        ...initial,
      } as DefaultValues<EnrollmentForm>,
    });
    methodsRef = methods;
    return <FormProvider {...methods}>{children}</FormProvider>;
  }

  return { Wrapper, getMethods: () => methodsRef };
}
