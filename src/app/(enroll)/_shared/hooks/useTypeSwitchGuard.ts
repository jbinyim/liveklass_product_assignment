"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { HEADCOUNT_MIN } from "@/app/(enroll)/_shared/constants";
import type {
  EnrollmentForm,
  Participant,
} from "@/app/(enroll)/_shared/schema";

type EnrollmentType = "personal" | "group";

interface GroupBlock {
  organizationName?: string;
  headCount?: number;
  participants?: Participant[];
  contactPerson?: string;
}

function isGroupEmpty(g: GroupBlock | undefined): boolean {
  if (!g) return true;
  if (g.organizationName && g.organizationName.length > 0) return false;
  if (g.contactPerson && g.contactPerson.length > 0) return false;
  if (g.participants && g.participants.length > 0) {
    const hasFilled = g.participants.some(
      (p) => (p.name && p.name.length > 0) || (p.email && p.email.length > 0),
    );
    if (hasFilled) return false;
  }
  return true;
}

interface ModalState {
  open: boolean;
  pendingType: EnrollmentType | null;
}

export interface TypeSwitchGuard {
  modalState: ModalState;
  requestSwitch: (next: EnrollmentType) => void;
  confirm: () => void;
  cancel: () => void;
}

export function useTypeSwitchGuard(): TypeSwitchGuard {
  const { getValues, setValue } = useFormContext<EnrollmentForm>();
  const [modalState, setModalState] = useState<ModalState>({
    open: false,
    pendingType: null,
  });

  const applySwitch = (next: EnrollmentType) => {
    setValue("type", next, { shouldDirty: true });
    if (next === "personal") {
      // 단체 → 개인: group 블록을 빈 상태로 reset (discriminated union 정합성)
      setValue(
        "group",
        {
          organizationName: "",
          headCount: HEADCOUNT_MIN,
          participants: [],
          contactPerson: "",
        },
        { shouldDirty: true },
      );
    }
  };

  const requestSwitch = (next: EnrollmentType) => {
    const current = getValues("type");
    if (current === next) return;

    if (next === "personal") {
      const groupValues = getValues("group" as never) as
        | GroupBlock
        | undefined;
      if (isGroupEmpty(groupValues)) {
        applySwitch(next);
        return;
      }
      setModalState({ open: true, pendingType: next });
      return;
    }

    // 개인 → 단체: 잃을 데이터 없음 (applicant는 공통)
    applySwitch(next);
  };

  const confirm = () => {
    if (modalState.pendingType) {
      applySwitch(modalState.pendingType);
    }
    setModalState({ open: false, pendingType: null });
  };

  const cancel = () => {
    setModalState({ open: false, pendingType: null });
  };

  return { modalState, requestSwitch, confirm, cancel };
}
