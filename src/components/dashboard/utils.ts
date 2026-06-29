import { getRecordKey, Item, Order } from "@/lib/strapi";
import { ItemForm, ItemOption, OrderForm } from "./types";

export function toInputDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export function currentInputDate() {
  const date = new Date();
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function createEmptyItem(): ItemForm {
  return {
    name: "",
    description: "",
    price: "",
    is_available: true,
    item_created_at_: currentInputDate(),
    category: "main",
  };
}

export function createEmptyOrder(): OrderForm {
  const now = currentInputDate();

  return {
    order_status: "pending",
    total_amount: "",
    order_created_at: now,
    order_updated_at: now,
    itemKeys: [],
  };
}

export function toApiDate(value: string) {
  return value ? new Date(value).toISOString() : undefined;
}

export function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function itemFormFromRecord(item: Item): ItemForm {
  return {
    key: getRecordKey(item),
    name: item.name ?? "",
    description: item.description ?? "",
    price: item.price === undefined ? "" : String(item.price),
    is_available: Boolean(item.is_available),
    item_created_at_: toInputDate(item.item_created_at_),
    category: item.category ?? "main",
  };
}

export function extractOrderItemKeys(order: Order) {
  if (!order.items) return [];

  if (Array.isArray(order.items)) {
    return order.items
      .map((item) => getRecordKey(item))
      .filter((key): key is string | number => key !== undefined)
      .map(String);
  }

  if ("data" in order.items && Array.isArray(order.items.data)) {
    return order.items.data
      .map((item) => {
        if (!item || typeof item !== "object") return undefined;
        const record = item as {
          id?: number;
          documentId?: string;
          attributes?: { id?: number; documentId?: string };
        };

        return record.documentId ?? record.id ?? record.attributes?.documentId;
      })
      .filter((key): key is string | number => key !== undefined)
      .map(String);
  }

  return [];
}

export function orderFormFromRecord(order: Order): OrderForm {
  return {
    key: getRecordKey(order),
    order_status: order.order_status ?? "pending",
    total_amount:
      order.total_amount === undefined ? "" : String(order.total_amount),
    order_created_at: toInputDate(order.order_created_at),
    order_updated_at: toInputDate(order.order_updated_at),
    itemKeys: extractOrderItemKeys(order),
  };
}

export function itemPayload(form: ItemForm) {
  return {
    name: form.name,
    description: form.description,
    price: form.price || undefined,
    is_available: form.is_available,
    item_created_at_: toApiDate(form.item_created_at_),
    category: form.category,
  };
}

export function orderPayload(form: OrderForm, totalAmount: string) {
  return {
    order_status: form.order_status,
    total_amount: totalAmount || undefined,
    order_created_at: toApiDate(form.order_created_at),
    order_updated_at: toApiDate(form.order_updated_at),
    items: form.itemKeys.length ? form.itemKeys : undefined,
  };
}

export function parsePrice(price?: string | number) {
  if (price === undefined || price === null || price === "") return 0;
  const parsed = Number(String(price).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatMoney(value: number) {
  return value.toFixed(2);
}

export function itemOptionFromRecord(item: Item): ItemOption | undefined {
  const key = getRecordKey(item);
  if (!key) return undefined;

  return {
    key,
    label: item.name || `Item ${key}`,
    price: parsePrice(item.price),
  };
}
