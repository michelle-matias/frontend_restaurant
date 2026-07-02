export type StrapiRecord<T> = T & {
  id?: number;
  documentId?: string;
};

export type StrapiMediaFormat = {
  url?: string;
  width?: number;
  height?: number;
};

export type StrapiMedia = StrapiRecord<{
  url?: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: Record<string, StrapiMediaFormat>;
}>;

export type UploadedStrapiMedia = StrapiMedia & {
  id: number;
};

export type StrapiMediaField =
  | StrapiMedia
  | StrapiMedia[]
  | { data?: StrapiMedia | StrapiMedia[] | null };

export type Item = StrapiRecord<{
  name?: string;
  description?: string;
  price?: string | number;
  is_available?: boolean;
  item_created_at_?: string;
  category?: "starters" | "main" | "dessert" | "drinks";
  image?: StrapiMediaField;
  images?: StrapiMediaField;
  photo?: StrapiMediaField;
  picture?: StrapiMediaField;
  media?: StrapiMediaField;
  thumbnail?: StrapiMediaField;
}>;

export type Order = StrapiRecord<{
  order_updated_at?: string;
  order_status?: "pending" | "preparing" | "delivered" | "cancelled";
  total_amount?: string | number;
  order_created_at?: string;
  items?: Item[] | { data?: unknown[] };
}>;

export const STRAPI_URL =
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

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("files", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const message = await readErrorMessage(res);
    throw new Error(message ?? `Could not upload file. Status: ${res.status}`);
  }

  const uploadedFiles = (await res.json()) as UploadedStrapiMedia[];
  const uploadedFile = uploadedFiles[0];

  if (!uploadedFile?.id) {
    throw new Error("Upload succeeded but no file id was returned.");
  }

  return uploadedFile;
}

async function readErrorMessage(res: Response) {
  const fallback = `Could not upload file. Status: ${res.status}`;

  try {
    const json = (await res.json()) as { error?: string; message?: string };
    return json.error ?? json.message ?? fallback;
  } catch {
    return fallback;
  }
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
