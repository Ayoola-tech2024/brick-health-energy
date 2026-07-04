// ============================================================
// Brick Health Energy Solutions – InsForge Helper Module
// ============================================================
// Uses the InsForge REST API directly instead of the SDK,
// to avoid dependency issues with @insforge/shared-schemas.
// API paths: /api/database/records/{table} and /api/database/rpc/{fn}
// Auth: Bearer token only (no apikey header — that's a Supabase convention).

// ── Environment variables ────────────────────────────────────
const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL ?? '';
const INSFORGE_ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY ?? '';
const INSFORGE_SERVICE_ROLE_KEY = process.env.INSFORGE_SERVICE_ROLE_KEY ?? '';
const INSFORGE_REQUEST_TIMEOUT_MS =
  Number.parseInt(process.env.INSFORGE_REQUEST_TIMEOUT_MS ?? '', 10) || 7000;

// ── Types ────────────────────────────────────────────────────
export interface InsforgeQueryResult {
  data: any[] | null;
  error: string | null;
}

export interface InsforgeInsertResult {
  data: any | null;
  error: string | null;
}

// ── Configuration ────────────────────────────────────────────

/**
 * Returns true when all three required InsForge environment
 * variables are set to non-empty strings.
 */
export function isInsforgeConfigured(): boolean {
  return !!(INSFORGE_URL && INSFORGE_ANON_KEY && INSFORGE_SERVICE_ROLE_KEY);
}

/**
 * Returns the InsForge URL for reference / health-check purposes.
 */
export function getInsforgeUrl(): string {
  return INSFORGE_URL;
}

// ── REST API Helpers ─────────────────────────────────────────

/**
 * Get the headers for admin requests (service role key, bypasses RLS).
 */
function getAdminHeaders(): Record<string, string> {
  return {
    'Authorization': `Bearer ${INSFORGE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };
}

/**
 * Get the headers for public requests (anon key, respects RLS).
 */
function getPublicHeaders(): Record<string, string> {
  return {
    'Authorization': `Bearer ${INSFORGE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Build the REST API URL for a table.
 * InsForge API path: {baseUrl}/api/database/records/{table}
 */
function getTableUrl(table: string): string {
  const baseUrl = INSFORGE_URL.replace(/\/$/, '');
  return `${baseUrl}/api/database/records/${table}`;
}

async function fetchInsforge(
  input: string | URL,
  init: RequestInit = {},
  timeoutMs = INSFORGE_REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const upstreamSignal = init.signal;
  const abort = () => controller.abort();
  const timer = setTimeout(abort, timeoutMs);

  if (upstreamSignal?.aborted) {
    controller.abort();
  } else {
    upstreamSignal?.addEventListener('abort', abort, { once: true });
  }

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error(`InsForge request timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
    upstreamSignal?.removeEventListener('abort', abort);
  }
}

/**
 * Query rows from a table with filters.
 * 
 * @param table - Table name (e.g., 'orders', 'users')
 * @param options - Query options
 * @returns Query result with data or error
 */
export async function insforgeSelect(
  table: string,
  options: {
    select?: string;        // Columns to select, default '*'
    filters?: Record<string, any>;  // Column filters (exact match)
    order?: string;         // Order by column
    ascending?: boolean;    // Order direction
    limit?: number;         // Max rows
  } = {}
): Promise<InsforgeQueryResult> {
  if (!isInsforgeConfigured()) {
    return { data: null, error: 'InsForge is not configured' };
  }

  try {
    const url = new URL(getTableUrl(table));
    
    // Select
    url.searchParams.set('select', options.select || '*');
    
    // Filters
    if (options.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        url.searchParams.set(key, `eq.${value}`);
      }
    }
    
    // Order
    if (options.order) {
      url.searchParams.set('order', `${options.order}.${options.ascending ? 'asc' : 'desc'}`);
    }
    
    // Limit
    if (options.limit) {
      url.searchParams.set('limit', String(options.limit));
    }

    const response = await fetchInsforge(url.toString(), {
      method: 'GET',
      headers: getAdminHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[InsForge] SELECT ${table} failed: ${response.status} ${errorText}`);
      return { data: null, error: `${response.status}: ${errorText}` };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err: any) {
    console.warn(`[InsForge] SELECT ${table} error:`, err?.message);
    return { data: null, error: err?.message || 'Unknown error' };
  }
}

/**
 * Insert a row into a table.
 * 
 * @param table - Table name
 * @param record - Record to insert
 * @returns Insert result with data or error
 */
export async function insforgeInsert(
  table: string,
  record: Record<string, any>
): Promise<InsforgeInsertResult> {
  if (!isInsforgeConfigured()) {
    return { data: null, error: 'InsForge is not configured' };
  }

  try {
    const response = await fetchInsforge(getTableUrl(table), {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[InsForge] INSERT ${table} failed: ${response.status} ${errorText}`);
      return { data: null, error: `${response.status}: ${errorText}` };
    }

    const data = await response.json();
    // PostgREST returns array from insert, get first item
    const record_data = Array.isArray(data) ? data[0] : data;
    return { data: record_data, error: null };
  } catch (err: any) {
    console.warn(`[InsForge] INSERT ${table} error:`, err?.message);
    return { data: null, error: err?.message || 'Unknown error' };
  }
}

/**
 * Update rows in a table.
 * 
 * @param table - Table name
 * @param filters - Which rows to update
 * @param updates - Fields to update
 * @returns Update result
 */
export async function insforgeUpdate(
  table: string,
  filters: Record<string, any>,
  updates: Record<string, any>
): Promise<InsforgeQueryResult> {
  if (!isInsforgeConfigured()) {
    return { data: null, error: 'InsForge is not configured' };
  }

  try {
    const url = new URL(getTableUrl(table));
    
    for (const [key, value] of Object.entries(filters)) {
      url.searchParams.set(key, `eq.${value}`);
    }

    const response = await fetchInsforge(url.toString(), {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[InsForge] UPDATE ${table} failed: ${response.status} ${errorText}`);
      return { data: null, error: `${response.status}: ${errorText}` };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err: any) {
    console.warn(`[InsForge] UPDATE ${table} error:`, err?.message);
    return { data: null, error: err?.message || 'Unknown error' };
  }
}

/**
 * Delete rows from a table.
 */
export async function insforgeDelete(
  table: string,
  filters: Record<string, any>
): Promise<InsforgeQueryResult> {
  if (!isInsforgeConfigured()) {
    return { data: null, error: 'InsForge is not configured' };
  }

  try {
    const url = new URL(getTableUrl(table));
    
    for (const [key, value] of Object.entries(filters)) {
      url.searchParams.set(key, `eq.${value}`);
    }

    const response = await fetchInsforge(url.toString(), {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[InsForge] DELETE ${table} failed: ${response.status} ${errorText}`);
      return { data: null, error: `${response.status}: ${errorText}` };
    }

    return { data: [], error: null };
  } catch (err: any) {
    console.warn(`[InsForge] DELETE ${table} error:`, err?.message);
    return { data: null, error: err?.message || 'Unknown error' };
  }
}

/**
 * Execute an RPC (remote procedure call / database function).
 */
export async function insforgeRpc(
  functionName: string,
  args: Record<string, any>
): Promise<InsforgeInsertResult> {
  if (!isInsforgeConfigured()) {
    return { data: null, error: 'InsForge is not configured' };
  }

  try {
    const baseUrl = INSFORGE_URL.replace(/\/$/, '');
    const url = `${baseUrl}/api/database/rpc/${functionName}`;

    const response = await fetchInsforge(url, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(args),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[InsForge] RPC ${functionName} failed: ${response.status} ${errorText}`);
      return { data: null, error: `${response.status}: ${errorText}` };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err: any) {
    console.warn(`[InsForge] RPC ${functionName} error:`, err?.message);
    return { data: null, error: err?.message || 'Unknown error' };
  }
}

/**
 * Safely attempts an InsForge operation. Returns the result or
 * `null` (plus a logged warning) when InsForge is not configured.
 */
export async function tryInsforge<T>(
  fn: () => Promise<{ data: T | null; error: string | null }>
): Promise<{ data: T | null; error: null } | { data: null; error: Error }> {
  try {
    const result = await fn();
    if (result.error) {
      console.warn('[InsForge] Operation returned error:', result.error);
      return { data: null, error: new Error(result.error) };
    }
    return { data: result.data, error: null };
  } catch (err) {
    console.warn('[InsForge] Operation failed:', err);
    return { data: null, error: err as Error };
  }
}
