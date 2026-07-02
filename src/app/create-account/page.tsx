import type { Metadata } from "next";
import { CreateAccountExperience } from "@/components/CreateAccountExperience";

export const metadata: Metadata = {
  title: "Criar Conta",
  description: "Crie a sua conta no O Cantinho da Carmo.",
};

export default function CreateAccountPage() {
  return <CreateAccountExperience />;
}
