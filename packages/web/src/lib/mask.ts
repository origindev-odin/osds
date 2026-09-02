/** Mask listing contacts for the claim form. Never return the raw value. */
export function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "•••";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const lead = local.charAt(0);
  return `${lead}•••@${domain}`;
}

export function maskPhone(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  if (digits.length < 4) return "•••";
  const last3 = digits.slice(-3);
  if (digits.length === 11 && digits.startsWith("1")) {
    const area = digits.slice(1, 4);
    return `+1 (${area}) •••-•${last3}`;
  }
  return `+${digits.slice(0, digits.length - 7)} •••-•${last3}`;
}
