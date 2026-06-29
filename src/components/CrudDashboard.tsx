"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createRecord,
  deleteRecord,
  getCollection,
  getRecordKey,
  Item,
  Order,
  updateRecord,
} from "@/lib/strapi";

const categories = ["starters", "main", "dessert", "drinks"] as const;
const statuses = ["pending", "preparing", "delivered", "cancelled"] as const;

type ItemForm = {
  key?: string | number;
  item_id: string;
  name: string;
  description: string;
  price: string;
  is_available: boolean;
  item_created_at_: string;
  category: string;
};

type OrderForm = {
  key?: string | number;
  order_id: string;
  order_status: string;
  total_amount: string;
  order_created_at: string;
  order_updated_at: string;
  itemKeys: string[];
};

const emptyItem: ItemForm = {
  item_id: "",
  name: "",
  description: "",
  price: "",
  is_available: true,
  item_created_at_: "",
  category: "main",
};

const emptyOrder: OrderForm = {
  order_id: "",
  order_status: "pending",
  total_amount: "",
  order_created_at: "",
  order_updated_at: "",
  itemKeys: [],
};

function toInputDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function toApiDate(value: string) {
  return value ? new Date(value).toISOString() : undefined;
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function itemFormFromRecord(item: Item): ItemForm {
  return {
    key: getRecordKey(item),
    item_id: item.item_id ?? "",
    name: item.name ?? "",
    description: item.description ?? "",
    price: item.price ?? "",
    is_available: Boolean(item.is_available),
    item_created_at_: toInputDate(item.item_created_at_),
    category: item.category ?? "main",
  };
}

function orderFormFromRecord(order: Order): OrderForm {
  return {
    key: getRecordKey(order),
    order_id: order.order_id ?? "",
    order_status: order.order_status ?? "pending",
    total_amount: order.total_amount ?? "",
    order_created_at: toInputDate(order.order_created_at),
    order_updated_at: toInputDate(order.order_updated_at),
    itemKeys: [],
  };
}

function itemPayload(form: ItemForm) {
  return {
    item_id: form.item_id || undefined,
    name: form.name,
    description: form.description,
    price: form.price || undefined,
    is_available: form.is_available,
    item_created_at_: toApiDate(form.item_created_at_),
    category: form.category,
  };
}

function orderPayload(form: OrderForm) {
  return {
    order_id: form.order_id || undefined,
    order_status: form.order_status,
    total_amount: form.total_amount || undefined,
    order_created_at: toApiDate(form.order_created_at),
    order_updated_at: toApiDate(form.order_updated_at),
    items: form.itemKeys.length ? form.itemKeys : undefined,
  };
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-md border border-stone-300 bg-white px-2 text-xs font-medium text-stone-700">
      {children}
    </span>
  );
}

export function CrudDashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [itemForm, setItemForm] = useState<ItemForm>(emptyItem);
  const [orderForm, setOrderForm] = useState<OrderForm>(emptyOrder);
  const [activeTab, setActiveTab] = useState<"items" | "orders">("items");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const itemOptions = useMemo(
    () =>
      items
        .map((item) => ({
          key: getRecordKey(item),
          label: item.name || `Item ${item.item_id || item.id}`,
        }))
        .filter((item) => item.key),
    [items],
  );

  async function loadData() {
    setLoading(true);
    setMessage("");
    try {
      const [nextItems, nextOrders] = await Promise.all([
        getCollection<Item>("items"),
        getCollection<Order>("orders"),
      ]);
      setItems(nextItems);
      setOrders(nextOrders);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function submitItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (itemForm.key) {
        await updateRecord("items", itemForm.key, itemPayload(itemForm));
        setMessage("Item updated.");
      } else {
        await createRecord("items", itemPayload(itemForm));
        setMessage("Item created.");
      }
      setItemForm(emptyItem);
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save item.");
    }
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (orderForm.key) {
        await updateRecord("orders", orderForm.key, orderPayload(orderForm));
        setMessage("Order updated.");
      } else {
        await createRecord("orders", orderPayload(orderForm));
        setMessage("Order created.");
      }
      setOrderForm(emptyOrder);
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save order.");
    }
  }

  async function removeRecord(collection: "items" | "orders", key?: string | number) {
    if (!key) return;
    try {
      await deleteRecord(collection, key);
      setMessage(`${collection === "items" ? "Item" : "Order"} deleted.`);
      await loadData();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : `Could not delete ${collection}.`,
      );
    }
  }

  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-stone-300 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
              BD Restaurant
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">
              Strapi CRUD Dashboard
            </h1>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="h-10 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white transition hover:bg-red-800"
          >
            Refresh API
          </button>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-stone-300 bg-white p-4">
            <p className="text-sm text-stone-500">Items</p>
            <p className="mt-2 text-3xl font-semibold">{items.length}</p>
          </div>
          <div className="rounded-lg border border-stone-300 bg-white p-4">
            <p className="text-sm text-stone-500">Orders</p>
            <p className="mt-2 text-3xl font-semibold">{orders.length}</p>
          </div>
          <div className="rounded-lg border border-stone-300 bg-white p-4">
            <p className="text-sm text-stone-500">API</p>
            <p className="mt-2 break-all text-base font-semibold">
              {process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337"}
            </p>
          </div>
        </section>

        {message ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {message}
          </div>
        ) : null}

        <div className="flex gap-2 border-b border-stone-300">
          {(["items", "orders"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`h-11 border-b-2 px-4 text-sm font-semibold capitalize ${
                activeTab === tab
                  ? "border-red-700 text-red-800"
                  : "border-transparent text-stone-500 hover:text-stone-950"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "items" ? (
          <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <form
              onSubmit={submitItem}
              className="rounded-lg border border-stone-300 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  {itemForm.key ? "Edit item" : "Create item"}
                </h2>
                {itemForm.key ? (
                  <button
                    type="button"
                    onClick={() => setItemForm(emptyItem)}
                    className="text-sm font-semibold text-red-700 hover:text-red-900"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              <div className="mt-4 grid gap-3">
                <label className="grid gap-1 text-sm font-medium">
                  Item ID
                  <input
                    value={itemForm.item_id}
                    onChange={(event) =>
                      setItemForm({ ...itemForm, item_id: event.target.value })
                    }
                    className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-red-700"
                    placeholder="1"
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Name
                  <input
                    required
                    value={itemForm.name}
                    onChange={(event) =>
                      setItemForm({ ...itemForm, name: event.target.value })
                    }
                    className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-red-700"
                    placeholder="Pizza Margherita"
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Description
                  <textarea
                    value={itemForm.description}
                    onChange={(event) =>
                      setItemForm({
                        ...itemForm,
                        description: event.target.value,
                      })
                    }
                    className="min-h-24 rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-red-700"
                    placeholder="Short menu description"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm font-medium">
                    Price
                    <input
                      value={itemForm.price}
                      onChange={(event) =>
                        setItemForm({ ...itemForm, price: event.target.value })
                      }
                      className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-red-700"
                      placeholder="12.50"
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-medium">
                    Category
                    <select
                      value={itemForm.category}
                      onChange={(event) =>
                        setItemForm({
                          ...itemForm,
                          category: event.target.value,
                        })
                      }
                      className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-red-700"
                    >
                      {categories.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="grid gap-1 text-sm font-medium">
                  Created at
                  <input
                    type="datetime-local"
                    value={itemForm.item_created_at_}
                    onChange={(event) =>
                      setItemForm({
                        ...itemForm,
                        item_created_at_: event.target.value,
                      })
                    }
                    className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-red-700"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={itemForm.is_available}
                    onChange={(event) =>
                      setItemForm({
                        ...itemForm,
                        is_available: event.target.checked,
                      })
                    }
                    className="size-4 accent-red-700"
                  />
                  Available
                </label>
                <button
                  type="submit"
                  className="h-10 rounded-md bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-800"
                >
                  {itemForm.key ? "Update item" : "Create item"}
                </button>
              </div>
            </form>

            <div className="overflow-hidden rounded-lg border border-stone-300 bg-white">
              <div className="border-b border-stone-300 px-4 py-3">
                <h2 className="text-lg font-semibold">Items from Strapi</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Available</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td className="px-4 py-6 text-stone-500" colSpan={6}>
                          Loading items...
                        </td>
                      </tr>
                    ) : items.length ? (
                      items.map((item) => {
                        const key = getRecordKey(item);
                        return (
                          <tr key={String(key)} className="border-t border-stone-200">
                            <td className="px-4 py-3">
                              <p className="font-semibold">{item.name || "-"}</p>
                              <p className="max-w-md truncate text-stone-500">
                                {item.description || "-"}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <Badge>{item.category || "-"}</Badge>
                            </td>
                            <td className="px-4 py-3">{item.price || "-"}</td>
                            <td className="px-4 py-3">
                              {item.is_available ? "Yes" : "No"}
                            </td>
                            <td className="px-4 py-3">
                              {formatDate(item.item_created_at_)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setItemForm(itemFormFromRecord(item))}
                                  className="h-9 rounded-md border border-stone-300 px-3 font-semibold hover:border-red-700 hover:text-red-700"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeRecord("items", key)}
                                  className="h-9 rounded-md bg-stone-950 px-3 font-semibold text-white hover:bg-red-800"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td className="px-4 py-6 text-stone-500" colSpan={6}>
                          No items yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <form
              onSubmit={submitOrder}
              className="rounded-lg border border-stone-300 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  {orderForm.key ? "Edit order" : "Create order"}
                </h2>
                {orderForm.key ? (
                  <button
                    type="button"
                    onClick={() => setOrderForm(emptyOrder)}
                    className="text-sm font-semibold text-red-700 hover:text-red-900"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              <div className="mt-4 grid gap-3">
                <label className="grid gap-1 text-sm font-medium">
                  Order ID
                  <input
                    value={orderForm.order_id}
                    onChange={(event) =>
                      setOrderForm({ ...orderForm, order_id: event.target.value })
                    }
                    className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-red-700"
                    placeholder="1001"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm font-medium">
                    Status
                    <select
                      value={orderForm.order_status}
                      onChange={(event) =>
                        setOrderForm({
                          ...orderForm,
                          order_status: event.target.value,
                        })
                      }
                      className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-red-700"
                    >
                      {statuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm font-medium">
                    Total
                    <input
                      value={orderForm.total_amount}
                      onChange={(event) =>
                        setOrderForm({
                          ...orderForm,
                          total_amount: event.target.value,
                        })
                      }
                      className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-red-700"
                      placeholder="25.00"
                    />
                  </label>
                </div>
                <label className="grid gap-1 text-sm font-medium">
                  Created at
                  <input
                    type="datetime-local"
                    value={orderForm.order_created_at}
                    onChange={(event) =>
                      setOrderForm({
                        ...orderForm,
                        order_created_at: event.target.value,
                      })
                    }
                    className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-red-700"
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Updated at
                  <input
                    type="datetime-local"
                    value={orderForm.order_updated_at}
                    onChange={(event) =>
                      setOrderForm({
                        ...orderForm,
                        order_updated_at: event.target.value,
                      })
                    }
                    className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-red-700"
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Items
                  <select
                    multiple
                    value={orderForm.itemKeys}
                    onChange={(event) =>
                      setOrderForm({
                        ...orderForm,
                        itemKeys: Array.from(
                          event.target.selectedOptions,
                          (option) => option.value,
                        ),
                      })
                    }
                    className="min-h-28 rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-red-700"
                  >
                    {itemOptions.map((item) => (
                      <option key={String(item.key)} value={String(item.key)}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className="h-10 rounded-md bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-800"
                >
                  {orderForm.key ? "Update order" : "Create order"}
                </button>
              </div>
            </form>

            <div className="overflow-hidden rounded-lg border border-stone-300 bg-white">
              <div className="border-b border-stone-300 px-4 py-3">
                <h2 className="text-lg font-semibold">Orders from Strapi</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                    <tr>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3">Updated</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td className="px-4 py-6 text-stone-500" colSpan={6}>
                          Loading orders...
                        </td>
                      </tr>
                    ) : orders.length ? (
                      orders.map((order) => {
                        const key = getRecordKey(order);
                        return (
                          <tr key={String(key)} className="border-t border-stone-200">
                            <td className="px-4 py-3 font-semibold">
                              {order.order_id || key}
                            </td>
                            <td className="px-4 py-3">
                              <Badge>{order.order_status || "-"}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              {order.total_amount || "-"}
                            </td>
                            <td className="px-4 py-3">
                              {formatDate(order.order_created_at)}
                            </td>
                            <td className="px-4 py-3">
                              {formatDate(order.order_updated_at)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOrderForm(orderFormFromRecord(order))
                                  }
                                  className="h-9 rounded-md border border-stone-300 px-3 font-semibold hover:border-red-700 hover:text-red-700"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeRecord("orders", key)}
                                  className="h-9 rounded-md bg-stone-950 px-3 font-semibold text-white hover:bg-red-800"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td className="px-4 py-6 text-stone-500" colSpan={6}>
                          No orders yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
