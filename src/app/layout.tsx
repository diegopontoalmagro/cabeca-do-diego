import "./globals.css";
import { Suspense } from "react";
import type { Metadata } from "next";
import SectionNav from "@/components/nav/SectionNav";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "cabeça do Diego",
  description: "Catálogo de erva-mate: chimarrão e tererê",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const db = supabaseServer();
  const [{ data: sections }, { data: categories }] = await Promise.all([
    db.from("sections").select("*").order("sort_order"),
    db.from("categories").select("*").order("sort_order"),
  ]);

  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Figtree:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col md:flex-row">
          <Suspense fallback={null}>
            <SectionNav sections={sections ?? []} categories={categories ?? []} />
          </Suspense>
          <main className="min-w-0 flex-1 px-4 pb-16 pt-6 md:px-10 md:pt-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
