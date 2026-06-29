import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BD Restaurant Frontend",
  description: "Next.js CRUD frontend for the BD Restaurant Strapi API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
