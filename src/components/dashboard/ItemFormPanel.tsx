import { Dispatch, FormEventHandler, SetStateAction } from "react";
import { categories, ItemForm } from "./types";

type ItemFormPanelProps = {
  form: ItemForm;
  onChange: Dispatch<SetStateAction<ItemForm>>;
  onClear: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export function ItemFormPanel({
  form,
  onChange,
  onClear,
  onSubmit,
}: ItemFormPanelProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-stone-300 bg-white p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {form.key ? "Edit item" : "Create item"}
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
        <label className="grid gap-1 text-sm font-medium">
          Name
          <input
            required
            value={form.name}
            onChange={(event) =>
              onChange({ ...form, name: event.target.value })
            }
            className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-red-700"
            placeholder="Pizza Margherita"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Description
          <textarea
            value={form.description}
            onChange={(event) =>
              onChange({ ...form, description: event.target.value })
            }
            className="min-h-24 rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-red-700"
            placeholder="Short menu description"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium">
            Price
            <input
              value={form.price}
              onChange={(event) =>
                onChange({ ...form, price: event.target.value })
              }
              className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-red-700"
              placeholder="12.50"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Category
            <select
              value={form.category}
              onChange={(event) =>
                onChange({ ...form, category: event.target.value })
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
            value={form.item_created_at_}
            onChange={(event) =>
              onChange({ ...form, item_created_at_: event.target.value })
            }
            className="h-10 rounded-md border border-stone-300 px-3 outline-none focus:border-red-700"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Image
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              onChange({
                ...form,
                imageFile: file,
                imageName: file?.name ?? form.imageName,
              });
            }}
            className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-stone-950 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-red-800"
          />
          {form.imageName ? (
            <span className="text-xs font-normal text-stone-500">
              {form.imageFile ? "Selected" : "Current"}: {form.imageName}
            </span>
          ) : null}
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.is_available}
            onChange={(event) =>
              onChange({ ...form, is_available: event.target.checked })
            }
            className="size-4 accent-red-700"
          />
          Available
        </label>
        <button
          type="submit"
          className="h-10 rounded-md bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-800"
        >
          {form.key ? "Update item" : "Create item"}
        </button>
      </div>
    </form>
  );
}
