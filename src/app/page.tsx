import { MenuExperience } from "@/components/MenuExperience";
import { loadMenuItems } from "@/lib/menu";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { items, error } = await loadMenuItems();

  return <MenuExperience items={items} error={error} />;
}
