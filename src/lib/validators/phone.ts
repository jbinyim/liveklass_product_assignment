export const KOREAN_PHONE_PATTERN =
  /^(01[016789]\d{7,8}|02\d{7,8}|0[3-9]\d\d{6,8})$/;

export function isKoreanPhone(value: string): boolean {
  const normalized = value.replace(/[\s-]/g, "");
  return KOREAN_PHONE_PATTERN.test(normalized);
}
