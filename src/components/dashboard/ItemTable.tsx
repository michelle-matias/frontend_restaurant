import { getRecordKey, Item } from "@/lib/strapi";
import { Badge } from "./Badge";
import { formatDate } from "./utils";

type ItemTableProps = {
  items: Item[];
  loading: boolean;
  onEdit: (item: Item) => void;
  onDelete: (key?: string | number) => void;
};

export function ItemTable({ items, loading, onEdit, onDelete }: ItemTableProps) {
  return (
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
                          onClick={() => onEdit(item)}
                          className="h-9 rounded-md border border-stone-300 px-3 font-semibold hover:border-red-700 hover:text-red-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(key)}
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
  );
}
