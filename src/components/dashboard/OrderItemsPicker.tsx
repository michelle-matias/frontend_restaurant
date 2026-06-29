import { ItemOption } from "./types";
import { formatMoney } from "./utils";

type OrderItemsPickerProps = {
  itemOptions: ItemOption[];
  selectedItemOptions: ItemOption[];
  selectedKeys: string[];
  onToggle: (key: string) => void;
};

export function OrderItemsPicker({
  itemOptions,
  selectedItemOptions,
  selectedKeys,
  onToggle,
}: OrderItemsPickerProps) {
  return (
    <fieldset className="grid gap-2 text-sm font-medium">
      <legend>Items</legend>
      <div className="rounded-md border border-stone-300 bg-white shadow-sm focus-within:border-red-700 focus-within:ring-2 focus-within:ring-red-100">
        <div className="flex min-h-12 flex-wrap items-center gap-2 border-b border-stone-200 px-3 py-2">
          {selectedItemOptions.length ? (
            selectedItemOptions.map((item) => (
              <span
                key={String(item.key)}
                className="inline-flex min-h-8 items-center gap-2 rounded-md bg-red-50 px-2.5 text-sm font-semibold text-red-900 ring-1 ring-red-200"
              >
                {item.label}
                <button
                  type="button"
                  onClick={() => onToggle(String(item.key))}
                  className="grid size-5 place-items-center rounded-full text-xs text-red-700 transition hover:bg-red-100"
                  aria-label={`Remove ${item.label}`}
                >
                  x
                </button>
              </span>
            ))
          ) : (
            <span className="text-sm font-normal text-stone-500">
              Select menu items
            </span>
          )}
        </div>

        <div className="max-h-52 overflow-y-auto p-2">
          {itemOptions.length ? (
            <div className="grid gap-1">
              {itemOptions.map((item) => {
                const key = String(item.key);
                const isSelected = selectedKeys.includes(key);

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onToggle(key)}
                    className={`flex min-h-11 items-center justify-between gap-3 rounded-md px-3 text-left transition ${
                      isSelected
                        ? "bg-red-700 text-white"
                        : "bg-white text-stone-800 hover:bg-stone-100"
                    }`}
                  >
                    <span className="truncate font-semibold">{item.label}</span>
                    <span
                      className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${
                        isSelected
                          ? "bg-white/15 text-white"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {formatMoney(item.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="px-3 py-4 text-sm font-normal text-stone-500">
              No items available.
            </p>
          )}
        </div>
      </div>
    </fieldset>
  );
}
