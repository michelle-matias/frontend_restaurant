"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { site } from "@/lib/site";
import {
  createRecord,
  deleteRecord,
  getCollection,
  Item,
  Order,
  updateRecord,
  uploadFile,
} from "@/lib/strapi";
import { DashboardTabs } from "./dashboard/DashboardTabs";
import { ItemFormPanel } from "./dashboard/ItemFormPanel";
import { ItemTable } from "./dashboard/ItemTable";
import { OrderFormPanel } from "./dashboard/OrderFormPanel";
import { OrderTable } from "./dashboard/OrderTable";
import { SummaryCards } from "./dashboard/SummaryCards";
import { ActiveTab } from "./dashboard/types";
import {
  createEmptyItem,
  createEmptyOrder,
  formatMoney,
  itemFormFromRecord,
  itemOptionFromRecord,
  itemPayload,
  orderFormFromRecord,
  orderPayload,
} from "./dashboard/utils";

export function CrudDashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [itemForm, setItemForm] = useState(() => createEmptyItem());
  const [orderForm, setOrderForm] = useState(() => createEmptyOrder());
  const [activeTab, setActiveTab] = useState<ActiveTab>("items");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const itemOptions = useMemo(
    () => items.map(itemOptionFromRecord).filter((item) => item !== undefined),
    [items],
  );

  const calculatedOrderTotal = useMemo(() => {
    const selectedKeys = new Set(orderForm.itemKeys);
    const total = itemOptions.reduce((sum, item) => {
      return selectedKeys.has(String(item.key)) ? sum + item.price : sum;
    }, 0);

    return formatMoney(total);
  }, [itemOptions, orderForm.itemKeys]);

  const selectedItemOptions = useMemo(() => {
    const selectedKeys = new Set(orderForm.itemKeys);
    return itemOptions.filter((item) => selectedKeys.has(String(item.key)));
  }, [itemOptions, orderForm.itemKeys]);

  function toggleOrderItem(key: string) {
    setOrderForm((current) => {
      const isSelected = current.itemKeys.includes(key);

      return {
        ...current,
        itemKeys: isSelected
          ? current.itemKeys.filter((itemKey) => itemKey !== key)
          : [...current.itemKeys, key],
      };
    });
  }

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
      let nextItemForm = itemForm;

      if (itemForm.imageFile) {
        const uploadedImage = await uploadFile(itemForm.imageFile);
        nextItemForm = {
          ...itemForm,
          imageKey: uploadedImage.id,
          imageFile: null,
          imageName:
            uploadedImage.alternativeText ||
            uploadedImage.caption ||
            uploadedImage.url ||
            itemForm.imageFile.name,
        };
      }

      if (itemForm.key) {
        await updateRecord("items", itemForm.key, itemPayload(nextItemForm));
        setMessage("Item updated.");
      } else {
        await createRecord("items", itemPayload(nextItemForm));
        setMessage("Item created.");
      }

      setItemForm(createEmptyItem());
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save item.");
    }
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (orderForm.key) {
        await updateRecord(
          "orders",
          orderForm.key,
          orderPayload(orderForm, calculatedOrderTotal),
        );
        setMessage("Order updated.");
      } else {
        await createRecord("orders", orderPayload(orderForm, calculatedOrderTotal));
        setMessage("Order created.");
      }

      setOrderForm(createEmptyOrder());
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
              {site.name}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">
              Área Admin
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              Crie, edite e remova items do menu ligados ao Strapi.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-10 items-center rounded-md border border-stone-300 px-4 text-sm font-semibold text-stone-800 transition hover:border-red-700 hover:text-red-700"
            >
              Voltar ao menu
            </Link>
            <button
              type="button"
              onClick={loadData}
              className="h-10 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white transition hover:bg-red-800"
            >
              Atualizar dados
            </button>
          </div>
        </header>

        <SummaryCards
          itemCount={items.length}
          orderCount={orders.length}
          apiUrl={process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337"}
        />

        {message ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {message}
          </div>
        ) : null}

        <DashboardTabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "items" ? (
          <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <ItemFormPanel
              form={itemForm}
              onChange={setItemForm}
              onClear={() => setItemForm(createEmptyItem())}
              onSubmit={submitItem}
            />
            <ItemTable
              items={items}
              loading={loading}
              onEdit={(item) => setItemForm(itemFormFromRecord(item))}
              onDelete={(key) => removeRecord("items", key)}
            />
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <OrderFormPanel
              form={orderForm}
              itemOptions={itemOptions}
              selectedItemOptions={selectedItemOptions}
              total={calculatedOrderTotal}
              onChange={setOrderForm}
              onClear={() => setOrderForm(createEmptyOrder())}
              onSubmit={submitOrder}
              onToggleItem={toggleOrderItem}
            />
            <OrderTable
              orders={orders}
              loading={loading}
              onEdit={(order) => setOrderForm(orderFormFromRecord(order))}
              onDelete={(key) => removeRecord("orders", key)}
            />
          </section>
        )}
      </div>
    </main>
  );
}
