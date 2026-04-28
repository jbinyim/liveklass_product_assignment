import { Suspense } from "react";
import { EnrollmentSummary } from "./_components/EnrollmentSummary";

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <EnrollmentSummary />
    </Suspense>
  );
}
