type SummaryCardsProps = {
  itemCount: number;
  orderCount: number;
  apiUrl: string;
};

export function SummaryCards({ itemCount, orderCount, apiUrl }: SummaryCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <div className="rounded-lg border border-stone-300 bg-white p-4">
        <p className="text-sm text-stone-500">Items</p>
        <p className="mt-2 text-3xl font-semibold">{itemCount}</p>
      </div>
      <div className="rounded-lg border border-stone-300 bg-white p-4">
        <p className="text-sm text-stone-500">Orders</p>
        <p className="mt-2 text-3xl font-semibold">{orderCount}</p>
      </div>
      <div className="rounded-lg border border-stone-300 bg-white p-4">
        <p className="text-sm text-stone-500">API</p>
        <p className="mt-2 break-all text-base font-semibold">{apiUrl}</p>
      </div>
    </section>
  );
}
