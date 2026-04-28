"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  HEADCOUNT_MAX,
  NAME_MIN,
  NAME_MAX,
} from "@/app/(enroll)/_shared/constants";
import { z } from "zod";

interface ParsedRow {
  raw: string;
  name: string;
  email: string;
  error?: string;
}

const rowSchema = z.object({
  name: z.string().min(NAME_MIN).max(NAME_MAX),
  email: z.email(),
});

function parseLines(text: string): ParsedRow[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((raw) => {
      const parts = raw.split(/[,\t]/).map((s) => s.trim());
      const [name = "", email = ""] = parts;
      const result = rowSchema.safeParse({ name, email });
      return {
        raw,
        name,
        email,
        error: result.success ? undefined : "형식 오류",
      };
    });
}

interface BulkPasteModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (rows: { name: string; email: string }[]) => void;
}

export function BulkPasteModal({
  open,
  onClose,
  onApply,
}: BulkPasteModalProps) {
  const [text, setText] = useState("");

  const rows = useMemo(() => parseLines(text), [text]);
  const valid = rows.filter((r) => !r.error);
  const truncated = valid.length > HEADCOUNT_MAX;
  const willApply = valid.slice(0, HEADCOUNT_MAX);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="참가자 일괄 입력"
      description="한 줄에 한 명씩, '이름,이메일' 또는 탭 구분으로 붙여넣으세요."
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button
            disabled={willApply.length === 0}
            onClick={() => {
              onApply(
                willApply.map((r) => ({ name: r.name, email: r.email })),
              );
              setText("");
              onClose();
            }}
          >
            {willApply.length}명 적용
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <textarea
          aria-label="참가자 일괄 붙여넣기"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"김민수,min@example.com\n이지영\tj@example.com"}
          className="h-32 w-full rounded-[var(--radius-input)] border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
        {rows.length > 0 && (
          <div className="max-h-40 overflow-y-auto rounded-md border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface)]">
                <tr>
                  <th className="px-3 py-1.5 text-left text-xs font-semibold text-[var(--color-text-muted)]">
                    #
                  </th>
                  <th className="px-3 py-1.5 text-left text-xs font-semibold text-[var(--color-text-muted)]">
                    이름
                  </th>
                  <th className="px-3 py-1.5 text-left text-xs font-semibold text-[var(--color-text-muted)]">
                    이메일
                  </th>
                  <th className="px-3 py-1.5 text-left text-xs font-semibold text-[var(--color-text-muted)]">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={i}
                    className={
                      r.error ? "bg-red-50 text-[var(--color-error)]" : ""
                    }
                  >
                    <td className="px-3 py-1">{i + 1}</td>
                    <td className="px-3 py-1">{r.name || "—"}</td>
                    <td className="px-3 py-1">{r.email || "—"}</td>
                    <td className="px-3 py-1">{r.error ?? "OK"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {truncated && (
          <p
            role="alert"
            className="text-xs text-[var(--color-warning)]"
          >
            최대 {HEADCOUNT_MAX}명까지만 적용됩니다. 처음 {HEADCOUNT_MAX}명만
            적용됩니다.
          </p>
        )}
      </div>
    </Modal>
  );
}
