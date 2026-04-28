import clsx from "clsx";

interface SpinnerProps {
  size?: "sm" | "md";
  className?: string;
  "aria-label"?: string;
}

const SIZE_CLASS: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
};

export function Spinner({
  size = "md",
  className,
  "aria-label": ariaLabel = "로딩 중",
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={clsx(
        "inline-block animate-spin rounded-full border-current border-t-transparent",
        SIZE_CLASS[size],
        className,
      )}
    />
  );
}
