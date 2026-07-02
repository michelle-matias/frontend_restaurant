import type { Metadata } from "next";
import { LoginExperience } from "@/components/LoginExperience";

export const metadata: Metadata = {
  title: "Login",
  description: "Inicie sessão na sua conta O Cantinho da Carmo.",
};

export default function LoginPage() {
  return <LoginExperience />;
}
