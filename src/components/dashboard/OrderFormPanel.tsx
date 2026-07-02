import { Dispatch, FormEventHandler, SetStateAction } from "react";
import { OrderItemsPicker } from "./OrderItemsPicker";
import { ItemOption, OrderForm, statuses } from "./types";

type OrderFormPanelProps = {
  form: OrderForm;
  itemOptions: ItemOption[];
  selectedItemOptions: ItemOption[];
  total: string;
  onChange: Dispatch<SetStateAction<OrderForm>>;
  onClear: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onToggleItem: (key: string) => void;
};

export function OrderFormPanel({
  form,
  itemOptions,
  selectedItemOptions,
  total,
  onChange,
  onClear,
  onSubmit,
  onToggleItem,
}: OrderFormPanelProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-stone-300 bg-white p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {form.key ? "Edit order" : "Create order"}
        </h2>
        {form.key ? (
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-semibold text-red-700 hover:text-red-900"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid content-start gap-1 text-sm font-medium">
            Status
            <select
              value={form.order_status}
              onChange={(event) =>
                onChange({ ...form, order_status: event.target.value })
              }
              className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-red-700"
            >
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label className="grid content-start gap-1 text-sm font-medium sm:mx-4 w-full min-w-0">
            Total
            <input
              value={total}
              readOnly
              className="h-10 rounded-md border border-stone-300 bg-stone-100 px-3 text-stone-700 outline-none"
              aria-describedby="order-total-help"
            />
            <span id="order-total-help" className="text-xs text-stone-500">
              Calculated from selected item prices
            </span>
          </label>
        </div>
        <label className="grid gap-1 text-sm font-medium">
          Created at
          <input
            type="datetime-local"
            value={form.order_created_at}
            onChange={(event) =>
              onChange({ ...form, order_created_at: event.target.value })
            }
            className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-red-700"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Updated at
          <input
            type="datetime-local"
            value={form.order_updated_at}
            onChange={(event) =>
              onChange({ ...form, order_updated_at: event.target.value })
            }
            className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-red-700"
          />
        </label>
        <OrderItemsPicker
          itemOptions={itemOptions}
          selectedItemOptions={selectedItemOptions}
          selectedKeys={form.itemKeys}
          onToggle={onToggleItem}
        />
        <button
          type="submit"
          className="h-10 rounded-md bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-800"
        >
          {form.key ? "Update order" : "Create order"}
        </button>
      </div>
    </form>
  );
}
