/** Phone validation helpers — no mongoose dependency, safe to import in client components. */

export const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

export function normalizeBDPhone(input: string): string {
  if (!input) return input;
  let digits = String(input).replace(/\D/g, "");
  if (digits.startsWith("880")) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith("1")) digits = "0" + digits;
  return digits;
}
