import { getRecordKey, Order } from "@/lib/strapi";
import { Badge } from "./Badge";
import { formatDate } from "./utils";

type OrderTableProps = {
  orders: Order[];
  loading: boolean;
  onEdit: (order: Order) => void;
  onDelete: (key?: string | number) => void;
};

export function OrderTable({
  orders,
  loading,
  onEdit,
  onDelete,
}: OrderTableProps) {
  return (
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
                    <td className="px-4 py-3 font-semibold">{key}</td>
                    <td className="px-4 py-3">
                      <Badge>{order.order_status || "-"}</Badge>
                    </td>
                    <td className="px-4 py-3">{order.total_amount || "-"}</td>
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
                          onClick={() => onEdit(order)}
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
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
