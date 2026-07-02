"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { getItemImage } from "@/lib/itemMedia";
import { site } from "@/lib/site";
import { createRecord, getRecordKey, Item } from "@/lib/strapi";
import { parsePrice } from "./dashboard/utils";
import { RestaurantIcon } from "./RestaurantIcon";

type MenuExperienceProps = {
  items: Item[];
  error?: string;
};

type CartLine = {
  item: Item;
  quantity: number;
};

type OrderPayload = {
  order_status: "pending";
  total_amount: string;
  order_created_at: string;
  order_updated_at: string;
  items: Array<string | number>;
};

const categoryLabels: Record<string, string> = {
  starters: "Petiscos",
  main: "Pratos Principais",
  dessert: "Sobremesas",
  drinks: "Bebidas",
  other: "Outros",
};

const categoryOrder = ["starters", "main", "dessert", "drinks", "other"];
const customerSessionEvent = "customer-session-change";

function subscribeToCustomerSession(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("focus", onStoreChange);
  window.addEventListener(customerSessionEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("focus", onStoreChange);
    window.removeEventListener(customerSessionEvent, onStoreChange);
  };
}

function getCustomerSessionSnapshot() {
  return JSON.stringify({
    isLoggedIn: Boolean(window.localStorage.getItem("strapiJwt")),
    name: window.localStorage.getItem("customerName") ?? "",
  });
}

function getCustomerSessionServerSnapshot() {
  return JSON.stringify({
    isLoggedIn: false,
    name: "",
  });
}

function clearCustomerSession() {
  window.localStorage.removeItem("strapiJwt");
  window.localStorage.removeItem("customerId");
  window.localStorage.removeItem("customerEmail");
  window.localStorage.removeItem("customerName");
  window.dispatchEvent(new Event(customerSessionEvent));
}

function formatEuro(value?: string | number) {
  const amount = parsePrice(value);

  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function itemKey(item: Item, index?: number) {
  return String(getRecordKey(item) ?? item.name ?? `item-${index ?? 0}`);
}

function getCategory(item: Item) {
  return item.category && categoryLabels[item.category] ? item.category : "other";
}

export function MenuExperience({ items, error }: MenuExperienceProps) {
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [failedImageKeys, setFailedImageKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [orderMessage, setOrderMessage] = useState("");
  const [orderError, setOrderError] = useState("");
  const [isSendingOrder, setIsSendingOrder] = useState(false);
  const customerSession = JSON.parse(
    useSyncExternalStore(
      subscribeToCustomerSession,
      getCustomerSessionSnapshot,
      getCustomerSessionServerSnapshot,
    ),
  ) as { isLoggedIn: boolean; name: string };

  const availableItems = useMemo(
    () => items.filter((item) => item.is_available !== false),
    [items],
  );

  const groupedItems = useMemo(() => {
    const groups = availableItems.reduce<Record<string, Item[]>>((acc, item) => {
      const category = getCategory(item);
      acc[category] = [...(acc[category] ?? []), item];
      return acc;
    }, {});

    return categoryOrder
      .map((category) => ({
        category,
        label: categoryLabels[category],
        items: groups[category] ?? [],
      }))
      .filter((group) => group.items.length > 0);
  }, [availableItems]);

  const cartLines = Object.entries(cart);
  const total = cartLines.reduce((sum, [, line]) => {
    return sum + parsePrice(line.item.price) * line.quantity;
  }, 0);

  function addToCart(item: Item) {
    const key = itemKey(item);

    setOrderMessage("");
    setOrderError("");
    setCart((current) => ({
      ...current,
      [key]: {
        item,
        quantity: (current[key]?.quantity ?? 0) + 1,
      },
    }));
  }

  async function sendOrderToKitchen() {
    if (cartLines.length === 0 || isSendingOrder) return;

    const orderItemKeys = cartLines
      .map(([, line]) => getRecordKey(line.item))
      .filter((key): key is string | number => key !== undefined);

    if (orderItemKeys.length === 0) {
      setOrderError("Não foi possível identificar os items do pedido.");
      return;
    }

    setIsSendingOrder(true);
    setOrderMessage("");
    setOrderError("");

    try {
      const now = new Date().toISOString();

      await createRecord<OrderPayload>("orders", {
        order_status: "pending",
        total_amount: total.toFixed(2),
        order_created_at: now,
        order_updated_at: now,
        items: orderItemKeys,
      });

      setCart({});
      setOrderMessage("Pedido enviado para a cozinha.");
    } catch (submitError) {
      setOrderError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível enviar o pedido.",
      );
    } finally {
      setIsSendingOrder(false);
    }
  }

  function decreaseQuantity(key: string) {
    setCart((current) => {
      const line = current[key];
      if (!line) return current;

      if (line.quantity <= 1) {
        const nextCart = { ...current };
        delete nextCart[key];
        return nextCart;
      }

      return {
        ...current,
        [key]: { ...line, quantity: line.quantity - 1 },
      };
    });
  }

  function increaseQuantity(key: string) {
    setCart((current) => {
      const line = current[key];
      if (!line) return current;

      return {
        ...current,
        [key]: { ...line, quantity: line.quantity + 1 },
      };
    });
  }

  return (
    <main className="min-h-screen bg-surface text-on-surface">
      <header className="bg-inverse-surface text-inverse-on-surface shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-8">
            <a href="#menu" className="flex items-center gap-2">
              <RestaurantIcon className="size-8 text-primary-container" />
              <span className="font-headline text-xl font-bold tracking-tight">
                {site.name}
              </span>
            </a>
            <nav className="hidden gap-6 text-sm font-medium uppercase tracking-wider text-surface-variant md:flex">
              <a className="border-b-2 border-primary-container text-white" href="#menu">
                Menu
              </a>
              <Link
                className="transition-colors hover:text-primary-container"
                href="/admin"
              >
                Admin
              </Link>
            </nav>
          </div>

          <div className="hidden items-center gap-4 sm:flex">
            <span className="text-sm text-surface-variant">
              Olá, {customerSession.name || "Visitante"}
            </span>
            {customerSession.isLoggedIn ? (
              <button
                type="button"
                onClick={clearCustomerSession}
                className="rounded-eight border border-outline px-3 py-1 text-xs text-inverse-on-surface transition-colors hover:bg-surface-container-highest hover:text-on-surface"
              >
                Sair
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-eight border border-outline px-3 py-1 text-xs text-inverse-on-surface transition-colors hover:bg-surface-container-highest hover:text-on-surface"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 lg:flex-row">
        <section id="menu" className="flex-grow">
          <div className="mb-8">
            <p className="font-headline text-sm font-semibold uppercase tracking-wider text-primary">
              Menu
            </p>
            <h1 className="mt-2 font-headline text-3xl font-bold text-on-surface sm:text-4xl">
              Nosso Menu
            </h1>
          </div>

          {error ? (
            <div className="rounded-eight border border-error-container bg-error-container px-5 py-4 text-on-error-container">
              {error}
            </div>
          ) : null}

          {!error && groupedItems.length === 0 ? (
            <div className="rounded-eight border border-outline-variant bg-surface-container-lowest px-5 py-12 text-center text-on-surface-variant">
              Ainda não existem items disponíveis no menu.
            </div>
          ) : null}

          <div className="space-y-10">
            {groupedItems.map((group) => (
              <section key={group.category}>
                <h2 className="mb-6 border-b border-outline-variant pb-2 font-headline text-2xl font-semibold text-primary">
                  {group.label}
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((item, index) => {
                    const key = itemKey(item, index);
                    const itemImage = getItemImage(item);
                    const hasImage = itemImage && !failedImageKeys.has(key);

                    return (
                      <article
                        key={key}
                        className="flex h-full flex-col overflow-hidden rounded-eight border border-outline-variant bg-surface-container-lowest shadow-sm"
                      >
                        <div className="relative flex h-40 items-center justify-center bg-surface-container-high text-on-surface-variant">
                          {hasImage ? (
                            <Image
                              src={itemImage.url}
                              alt={itemImage.alt}
                              fill
                              unoptimized
                              sizes="(min-width: 1280px) 280px, (min-width: 640px) 50vw, 100vw"
                              className="object-cover"
                              onError={() => {
                                setFailedImageKeys((current) => {
                                  const next = new Set(current);
                                  next.add(key);
                                  return next;
                                });
                              }}
                            />
                          ) : (
                            <span className="text-xs font-medium">
                              Imagem Indisponível
                            </span>
                          )}
                        </div>
                        <div className="flex flex-grow flex-col p-4 text-center">
                          <h3 className="font-headline text-lg font-semibold text-on-surface">
                            {item.name || "Item sem nome"}
                          </h3>
                          {item.description ? (
                            <p className="mt-2 line-clamp-3 text-sm leading-6 text-on-surface-variant">
                              {item.description}
                            </p>
                          ) : null}
                          <p className="mt-3 font-bold text-primary">
                            {formatEuro(item.price)}
                          </p>
                          <button
                            type="button"
                            onClick={() => addToCart(item)}
                            className="mt-auto w-full rounded-eight bg-primary-container px-4 py-2 font-semibold text-white shadow-sm transition-all hover:bg-primary"
                          >
                            Adicionar ao Carrinho
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </section>

        <aside className="w-full shrink-0 lg:w-80">
          <div className="sticky top-8 overflow-hidden rounded-eight border border-outline-variant bg-surface-container-lowest shadow-lg">
            <div className="bg-inverse-surface px-4 py-3 font-semibold text-inverse-on-surface">
              O Seu Pedido
            </div>
            <div className="flex min-h-40 flex-col justify-between p-6">
              {cartLines.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-sm italic text-on-surface-variant">
                    O seu carrinho está vazio.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartLines.map(([key, line]) => (
                    <div
                      key={key}
                      className="border-b border-outline-variant pb-4 last:border-b-0"
                    >
                      <div className="flex justify-between gap-3">
                        <p className="font-semibold text-on-surface">
                          {line.item.name || "Item sem nome"}
                        </p>
                        <p className="font-bold text-primary">
                          {formatEuro(parsePrice(line.item.price) * line.quantity)}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center rounded-eight border border-outline-variant">
                          <button
                            type="button"
                            onClick={() => decreaseQuantity(key)}
                            className="size-8 font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low"
                            aria-label={`Diminuir quantidade de ${line.item.name}`}
                          >
                            -
                          </button>
                          <span className="min-w-8 text-center text-sm font-semibold">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => increaseQuantity(key)}
                            className="size-8 font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low"
                            aria-label={`Aumentar quantidade de ${line.item.name}`}
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm text-on-surface-variant">
                          {formatEuro(line.item.price)} cada
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 border-t border-outline-variant pt-4">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Total
                  </span>
                  <span className="text-xl font-bold text-on-surface">
                    {formatEuro(total)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={sendOrderToKitchen}
                  disabled={cartLines.length === 0 || isSendingOrder}
                  className="w-full rounded-eight bg-secondary py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md transition-all hover:bg-on-secondary-container disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSendingOrder ? "A enviar..." : "Enviar para a Cozinha"}
                </button>
                {orderMessage ? (
                  <p className="mt-3 rounded-eight bg-secondary-container px-3 py-2 text-sm font-semibold text-on-secondary-container">
                    {orderMessage}
                  </p>
                ) : null}
                {orderError ? (
                  <p className="mt-3 rounded-eight bg-error-container px-3 py-2 text-sm font-semibold text-on-error-container">
                    {orderError}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
