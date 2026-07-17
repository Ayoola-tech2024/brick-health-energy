/**
 * Admin authorization helper.
 *
 * Admin emails are configured via the ADMIN_EMAILS env var
 * (comma-separated, case-insensitive). Falls back to the
 * default owner email if unset, so the app keeps working in dev.
 *
 * IMPORTANT: `isAdminEmail` alone is NOT a security control. It must be
 * combined with a verified server-side identity (see `getServerAdminUser`)
 * because client-only email checks can be bypassed. The real authorization
 * boundary is InsForge RLS (service-role key bypasses it, so API routes that
 * use the service role MUST call `requireAdmin` first).
 */

const DEFAULT_ADMIN_EMAILS = "damisileayoola@gmail.com,adamsromeo163@gmail.com";

function readEnv(): string | undefined {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_ADMIN_EMAILS;
  }
  return process.env.ADMIN_EMAILS ?? process.env.NEXT_PUBLIC_ADMIN_EMAILS;
}

export function getAdminEmails(): string[] {
  const raw = readEnv()?.trim();
  if (!raw) return DEFAULT_ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase());
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const admins = getAdminEmails();
  return admins.includes(email.toLowerCase());
}
