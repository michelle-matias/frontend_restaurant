export type StrapiRecord<T> = T & {
  id?: number;
  documentId?: string;
};

export type Item = StrapiRecord<{
  name?: string;
  description?: string;
  price?: string | number;
  is_available?: boolean;
  item_created_at_?: string;
  category?: "starters" | "main" | "dessert" | "drinks";
}>;

export type Order = StrapiRecord<{
  order_updated_at?: string;
  order_status?: "pending" | "preparing" | "delivered" | "cancelled";
  total_amount?: string | number;
  order_created_at?: string;
  items?: Item[] | { data?: unknown[] };
}>;

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, "") ??
  "http://localhost:1337";

type ApiResponse<T> = {
  data?: Array<T & { attributes?: T }>;
};

function normalizeRecord<T extends object>(
  record: T & { id?: number; documentId?: string; attributes?: T },
) {
  return {
    id: record.id,
    documentId: record.documentId,
    ...(record.attributes ?? record),
  } as StrapiRecord<T>;
}

export function getRecordKey(record: StrapiRecord<object>) {
  return record.documentId ?? record.id;
}

export async function getCollection<T extends object>(collection: string) {
  const res = await fetch(`${STRAPI_URL}/api/${collection}?populate=*`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Could not load ${collection}. Status: ${res.status}`);
  }

  const json = (await res.json()) as ApiResponse<T>;
  return (json.data ?? []).map(normalizeRecord<T>);
}

export async function createRecord<T extends object>(
  collection: string,
  data: T,
) {
  const res = await fetch(`${STRAPI_URL}/api/${collection}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  if (!res.ok) {
    throw new Error(`Could not create ${collection}. Status: ${res.status}`);
  }

  return res.json();
}

export async function updateRecord<T extends object>(
  collection: string,
  key: string | number,
  data: T,
) {
  const res = await fetch(`${STRAPI_URL}/api/${collection}/${key}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  if (!res.ok) {
    throw new Error(`Could not update ${collection}. Status: ${res.status}`);
  }

  return res.json();
}

export async function deleteRecord(collection: string, key: string | number) {
  const res = await fetch(`${STRAPI_URL}/api/${collection}/${key}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(`Could not delete ${collection}. Status: ${res.status}`);
  }
}
