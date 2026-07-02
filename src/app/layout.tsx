import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: {
    default: `Nosso Menu | ${site.name}`,
    template: `%s | ${site.name}`,
  },
  description: "Menu com items carregados da base de dados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT" className={`${inter.variable} ${montserrat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
