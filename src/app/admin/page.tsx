import type { Metadata } from "next";
import { CrudDashboard } from "@/components/CrudDashboard";

export const metadata: Metadata = {
  title: "Admin",
  description: "Área administrativa para gerir items e pedidos.",
};

export default function AdminPage() {
  return <CrudDashboard />;
}
