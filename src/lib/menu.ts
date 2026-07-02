import { getCollection, Item } from "./strapi";

export type MenuItemsResult = {
  error?: string;
  items: Item[];
};

export async function loadMenuItems(): Promise<MenuItemsResult> {
  try {
    return { items: await getCollection<Item>("items") };
  } catch (error) {
    return {
      items: [],
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os items do menu.",
    };
  }
}
