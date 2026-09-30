"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError("E-mail ou senha incorretos."); setLoading(false); return; }
    router.push(next);
    router.refresh();
  }

  const input = "w-full rounded-lg border border-erva/25 bg-espuma px-3 py-2";
  return (
    <form onSubmit={onSubmit} className="max-w-sm space-y-4">
      <h1 className="text-3xl font-bold text-erva">Entrar</h1>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">E-mail</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
      </div>
      <div>
        <label htmlFor="senha" className="mb-1 block text-sm font-medium">Senha</label>
        <input id="senha" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button disabled={loading} className="w-full rounded-lg bg-erva py-2.5 font-semibold text-espuma disabled:opacity-60">
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginForm /></Suspense>;
}
