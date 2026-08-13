"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { portalHome } from "@/lib/auth/roles";
import type { UserRole } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState(
    params.get("error") === "disabled" ? "This account is disabled." : "",
  );
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError("");
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    try {
      const supabase = createClient();
      const { error: signError } = await supabase.auth.signInWithPassword({ email, password });
      if (signError) throw signError;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Could not read session");
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .single();
      if (profile?.status === "DISABLED") {
        await supabase.auth.signOut();
        throw new Error("This account is disabled.");
      }
      const next = params.get("next");
      const dest = next || portalHome(profile?.role as UserRole);
      router.replace(dest);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed");
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen bg-ink text-ivory">
      <div className="relative hidden flex-1 overflow-hidden md:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#3a3228,_#0c0b0a)]" />
        <div className="noise-overlay" />
        <div className="relative flex h-full flex-col justify-end p-12">
          <p className="text-[11px] tracking-[0.4em] text-gold uppercase">Uma Events</p>
          <h1 className="mt-4 font-serif text-5xl">Studio access</h1>
        </div>
      </div>
      <div className="flex w-full max-w-md flex-col justify-center px-8">
        <p className="font-serif text-3xl md:hidden">Uma Events</p>
        <h2 className="mt-2 font-serif text-4xl">Sign in</h2>
        <p className="mt-2 text-sm text-ivory/50">Owner, admin, and staff portals.</p>
        <form action={onSubmit} className="mt-10 space-y-4">
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-gold"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            className="w-full border border-white/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-gold"
          />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-gold py-3 text-[11px] tracking-[0.28em] text-ink uppercase disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Enter"}
          </button>
        </form>
      </div>
    </main>
  );
}
