const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL ?? "";
const SERVICE_KEY = process.env.INSFORGE_SERVICE_ROLE_KEY ?? "";

export async function ensurePublicUser(
  id: string,
  email: string,
  name?: string | null
): Promise<void> {
  if (!INSFORGE_URL || !SERVICE_KEY) return;
  try {
    await fetch(`${INSFORGE_URL.replace(/\/$/, "")}/api/database/records/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation,resolution=merge-duplicates",
      },
      body: JSON.stringify({ id, email, name: name || email.split("@")[0] }),
    });
  } catch {
    // best-effort
  }
}
