export const categories = ["starters", "main", "dessert", "drinks"] as const;
export const statuses = ["pending", "preparing", "delivered", "cancelled"] as const;

export type ActiveTab = "items" | "orders";

export type ItemForm = {
  key?: string | number;
  name: string;
  description: string;
  price: string;
  is_available: boolean;
  item_created_at_: string;
  category: string;
};

export type OrderForm = {
  key?: string | number;
  order_status: string;
  total_amount: string;
  order_created_at: string;
  order_updated_at: string;
  itemKeys: string[];
};

export type ItemOption = {
  key: string | number;
  label: string;
  price: number;
};
