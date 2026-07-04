// ============================================================
// Brick Health Energy Solutions – Order Tracking Helpers
// ============================================================
// InsForge's `orders` table has NO `tracking_number` column and DDL
// is not allowed via the REST API, so we store tracking information
// INSIDE the existing `items` JSONB field by wrapping it:
//
//   New DB shape:  items = { products: [...], tracking: { ... } | null }
//   Legacy DB shape: items = [ ...productItems ]   (flat array, pre-tracking)
//
// Every API response that returns an order MUST normalize the row so
// the frontend always sees:
//   { ...order, items: productsArray, tracking: trackingObjectOrNull }
//
// regardless of which physical shape lives in the database.

// ── Tracking shapes ───────────────────────────────────────────
export interface TrackingTimelineEntry {
  status: string;
  timestamp: string; // ISO string
  note: string;
}

export interface TrackingInfo {
  number: string;
  carrier?: string | null;
  estimated_delivery?: string | null; // ISO date (YYYY-MM-DD) or null
  timeline: TrackingTimelineEntry[];
}

// ── Internal helpers ──────────────────────────────────────────

/**
 * Coerce a raw `items` value (which may be a stringified JSON array,
 * a real array, or the new wrapper object) into the canonical
 * `{ products, tracking }` shape.
 */
export function unwrapItemsField(rawItems: unknown): {
  products: any[];
  tracking: TrackingInfo | null;
} {
  // The DB may return a JSON string (rare for jsonb, but defensive).
  let items: any = rawItems;
  if (typeof items === 'string' && items.length > 0) {
    try {
      items = JSON.parse(items);
    } catch {
      return { products: [], tracking: null };
    }
  }

  // Legacy flat array form: items = [product1, product2, ...]
  if (Array.isArray(items)) {
    return { products: items, tracking: null };
  }

  // New wrapper form: items = { products: [...], tracking: {...}|null }
  if (items && typeof items === 'object') {
    const products = Array.isArray((items as any).products)
      ? (items as any).products
      : [];
    const rawTracking = (items as any).tracking;
    const tracking: TrackingInfo | null =
      rawTracking && typeof rawTracking === 'object'
        ? normalizeTrackingObject(rawTracking)
        : null;
    return { products, tracking };
  }

  return { products: [], tracking: null };
}

/**
 * Ensure a tracking object always has a timeline array, even if the
 * stored data is missing it (defensive against partial writes).
 */
function normalizeTrackingObject(raw: any): TrackingInfo | null {
  if (!raw || typeof raw !== 'object') return null;
  const timeline = Array.isArray(raw.timeline) ? raw.timeline : [];
  return {
    number: typeof raw.number === 'string' ? raw.number : '',
    carrier: typeof raw.carrier === 'string' ? raw.carrier : null,
    estimated_delivery:
      typeof raw.estimated_delivery === 'string' ? raw.estimated_delivery : null,
    timeline: timeline
      .filter((e: any) => e && typeof e === 'object')
      .map((e: any) => ({
        status: typeof e.status === 'string' ? e.status : 'unknown',
        timestamp:
          typeof e.timestamp === 'string'
            ? e.timestamp
            : new Date().toISOString(),
        note: typeof e.note === 'string' ? e.note : '',
      })),
  };
}

// ── Public normalization ──────────────────────────────────────

/**
 * Map a raw InsForge order row (snake_case) to the camelCase shape
 * the frontend expects, ALWAYS returning `items` as a products array
 * and a separate `tracking` field.
 */
export function normalizeOrderRow(row: Record<string, any>) {
  const { products, tracking } = unwrapItemsField(row.items);
  return {
    id: row.id,
    userId: row.user_id,
    items: products,
    tracking,
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    total: row.total,
    status: row.status,
    paymentMethod: row.payment_method,
    deliveryName: row.delivery_name,
    deliveryPhone: row.delivery_phone,
    deliveryEmail: row.delivery_email,
    deliveryAddress: row.delivery_address,
    deliveryCity: row.delivery_city,
    deliveryState: row.delivery_state,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Tracking construction helpers ─────────────────────────────

/**
 * Default human-readable note for each order status, used when the
 * caller doesn't pass an explicit `note` for a timeline entry.
 */
export function defaultNoteForStatus(status: string): string {
  switch (status) {
    case 'pending':
      return 'Order placed';
    case 'confirmed':
      return 'Order confirmed and payment verified';
    case 'shipped':
      return 'Order shipped';
    case 'delivered':
      return 'Order delivered';
    case 'cancelled':
      return 'Order cancelled';
    default:
      return `Order status updated to ${status}`;
  }
}

/**
 * Build the DB-side `items` wrapper (the value to actually PATCH into
 * the `items` column) from a products array and a tracking object.
 */
export function buildItemsWrapper(
  products: any[],
  tracking: TrackingInfo | null
): { products: any[]; tracking: TrackingInfo | null } {
  return { products, tracking };
}

/**
 * Initialize a fresh tracking object for a newly-created order, with
 * the first timeline entry ("pending" → "Order placed").
 */
export function createInitialTracking(): TrackingInfo {
  return {
    number: '',
    carrier: null,
    estimated_delivery: null,
    timeline: [
      {
        status: 'pending',
        timestamp: new Date().toISOString(),
        note: defaultNoteForStatus('pending'),
      },
    ],
  };
}
