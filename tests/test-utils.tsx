import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { vi } from "vitest";
import {
  FormProvider,
  useForm,
  type DefaultValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 라우터 상태는 모듈 외부에서 hoist (vi.mock factory가 참조 가능하도록)
const routerState = vi.hoisted(() => ({
  path: "/",
  listeners: new Set<() => void>(),
}));

vi.mock("next/navigation", async () => {
  const ReactRequire = await import("react");
  const subscribe = (cb: () => void) => {
    routerState.listeners.add(cb);
    return () => {
      routerState.listeners.delete(cb);
    };
  };
  const setPath = (p: string) => {
    routerState.path = p;
    routerState.listeners.forEach((cb) => cb());
  };
  return {
    useRouter: () => ({
      push: setPath,
      replace: setPath,
      back: () => {},
      forward: () => {},
      refresh: () => {},
      prefetch: async () => {},
    }),
    usePathname: () => {
      const [path, setLocal] = ReactRequire.useState(routerState.path);
      ReactRequire.useEffect(() => {
        const unsubscribe = subscribe(() => setLocal(routerState.path));
        return unsubscribe;
      }, []);
      return path;
    },
    useSearchParams: () => {
      const [path, setLocal] = ReactRequire.useState(routerState.path);
      ReactRequire.useEffect(() => {
        const unsubscribe = subscribe(() => setLocal(routerState.path));
        return unsubscribe;
      }, []);
      const qs = path.includes("?") ? (path.split("?")[1] ?? "") : "";
      const params = new URLSearchParams(qs);
      return {
        get: (k: string) => params.get(k),
        toString: () => qs,
      };
    },
  };
});

// 도메인 import는 mock 후
import {
  enrollmentSchema,
  type EnrollmentForm,
} from "@/app/(enroll)/_shared/schema";
import { enrollmentDefaults } from "@/app/(enroll)/_shared/defaults";
import { Step1View } from "@/app/(enroll)/_components/Step1View";
import { Step2View } from "@/app/(enroll)/applicant/_components/Step2View";
import { Step3View } from "@/app/(enroll)/review/_components/Step3View";
import { EnrollmentSummary } from "@/app/(enroll)/success/_components/EnrollmentSummary";
import { DraftRestoreGate } from "@/app/(enroll)/_shared/components/DraftRestoreGate";
import { StepIndicator } from "@/app/(enroll)/_shared/components/StepIndicator";

export function setRouterPath(p: string) {
  routerState.path = p;
  routerState.listeners.forEach((cb) => cb());
}

export function getRouterPath(): string {
  return routerState.path;
}

export function resetRouter(): void {
  routerState.path = "/";
  routerState.listeners.forEach((cb) => cb());
}

function RoutedView() {
  const [path, setPath] = useState(routerState.path);
  useEffect(() => {
    const cb = () => setPath(routerState.path);
    routerState.listeners.add(cb);
    return () => {
      routerState.listeners.delete(cb);
    };
  }, []);

  if (path === "/") return <Step1View />;
  if (path === "/applicant") return <Step2View />;
  if (path === "/review") return <Step3View />;
  if (path.startsWith("/success")) return <EnrollmentSummary />;
  return <Step1View />;
}

interface IntegratedAppProps {
  children?: ReactNode;
  initialPath?: string;
}

export function IntegratedApp({ initialPath = "/" }: IntegratedAppProps = {}) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, staleTime: 0 },
          mutations: { retry: 0 },
        },
      }),
  );

  const methods = useForm<EnrollmentForm>({
    resolver: zodResolver(enrollmentSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: enrollmentDefaults as DefaultValues<EnrollmentForm>,
  });

  // 초기 경로 설정 (마운트 시 한 번)
  useEffect(() => {
    if (initialPath !== routerState.path) {
      routerState.path = initialPath;
      routerState.listeners.forEach((cb) => cb());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <QueryClientProvider client={client}>
      <FormProvider {...methods}>
        <DraftRestoreGate>
          <header className="mx-auto w-full max-w-3xl px-6 pt-8">
            <StepIndicator />
          </header>
          <RoutedView />
        </DraftRestoreGate>
      </FormProvider>
    </QueryClientProvider>
  );
}
