"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { loginCustomer, StrapiAuthResponse } from "@/lib/strapi";
import { AuthField } from "./AuthField";
import { AuthShell } from "./AuthShell";

function storeCustomerSession(auth: StrapiAuthResponse) {
  window.localStorage.setItem("strapiJwt", auth.jwt);
  window.localStorage.setItem("customerName", auth.user.username || "Cliente");

  if (auth.user.email) {
    window.localStorage.setItem("customerEmail", auth.user.email);
  }

  if (auth.user.id) {
    window.localStorage.setItem("customerId", String(auth.user.id));
  }
}

export function LoginExperience() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setIsSubmitting(true);
    setMessage("");

    try {
      const auth = await loginCustomer(email, password);
      storeCustomerSession(auth);
      setMessage("Sessão iniciada. A voltar ao menu...");
      router.push("/");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Não foi possível iniciar sessão.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      heroTitle="Sabores autênticos à sua mesa."
      heroText="Sinta-se em casa com a nossa gastronomia tradicional e um serviço de excelência."
      isFocused={isFocused}
    >
      <div className="mb-12">
        <h2 className="font-headline text-3xl font-bold text-on-surface">
          Bem-vindo de volta
        </h2>
        <p className="mt-1 text-on-surface-variant">
          Inicie sessão na sua conta O Cantinho da Carmo para gerir os seus
          pedidos.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <AuthField
          id="email"
          label="Endereço de Email"
          name="email"
          placeholder="nome@exemplo.com"
          required
          type="email"
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
        />

        <AuthField
          action={
            <a
              className="text-xs font-bold text-primary hover:underline"
              href="#recuperar"
            >
              Esqueceu-se da palavra-passe?
            </a>
          }
          id="password"
          label="Palavra-passe"
          name="password"
          placeholder="••••••••"
          required
          type="password"
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
        />

        <div className="flex items-center gap-2 py-1">
          <input
            className="size-5 rounded border-outline-variant accent-primary"
            id="remember"
            type="checkbox"
          />
          <label className="text-on-surface-variant" htmlFor="remember">
            Lembrar-me por 30 dias
          </label>
        </div>

        <button
          className="mt-3 w-full rounded-lg bg-primary py-4 font-headline font-bold text-on-primary shadow-md transition-all duration-200 hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "A autenticar..." : "Entrar"}
        </button>
      </form>

      {message ? (
        <p className="mt-4 rounded-lg bg-primary-container px-4 py-3 text-sm font-semibold text-on-primary-container">
          {message}
        </p>
      ) : null}

      <div className="mt-6 text-center">
        <Link className="text-sm font-bold text-primary hover:underline" href="/">
          Voltar ao menu
        </Link>
      </div>

      <p className="mt-10 text-center text-on-surface-variant">
        Não tem uma conta?{" "}
        <Link
          className="font-bold text-primary hover:underline"
          href="/create-account"
        >
          Criar conta
        </Link>
      </p>
    </AuthShell>
  );
}
