"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthField } from "./AuthField";
import { AuthShell } from "./AuthShell";

export function CreateAccountExperience() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const displayName = String(formData.get("name") ?? "").trim() || "Cliente";

    setIsSubmitting(true);
    setMessage("");

    window.setTimeout(() => {
      window.localStorage.setItem("customerName", displayName);
      setIsSubmitting(false);
      setMessage("Conta criada. A voltar ao menu...");
      router.push("/");
    }, 900);
  }

  return (
    <AuthShell
      heroTitle="A sua mesa começa aqui."
      heroText="Crie a sua conta para acompanhar pedidos e guardar as suas preferências."
      isFocused={isFocused}
      minHeight="min-h-[640px]"
    >
      <div className="mb-10">
        <h2 className="font-headline text-3xl font-bold text-on-surface">
          Criar conta
        </h2>
        <p className="mt-1 text-on-surface-variant">
          Junte-se ao O Cantinho da Carmo para gerir os seus pedidos.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <AuthField
          id="name"
          label="Nome completo"
          name="name"
          placeholder="O seu nome"
          required
          type="text"
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
        />

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
          id="phone"
          label="Telefone"
          name="phone"
          placeholder="+351 900 000 000"
          type="tel"
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
        />

        <AuthField
          id="password"
          label="Palavra-passe"
          name="password"
          placeholder="••••••••"
          required
          type="password"
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
        />

        <label className="flex items-start gap-2 py-1 text-sm text-on-surface-variant">
          <input
            className="mt-1 size-4 rounded border-outline-variant accent-primary"
            required
            type="checkbox"
          />
          <span>Aceito os termos de serviço e a política de privacidade.</span>
        </label>

        <button
          className="mt-3 w-full rounded-lg bg-primary py-4 font-headline font-bold text-on-primary shadow-md transition-all duration-200 hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "A criar conta..." : "Criar conta"}
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

      <p className="mt-8 text-center text-on-surface-variant">
        Já tem uma conta?{" "}
        <Link className="font-bold text-primary hover:underline" href="/login">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
