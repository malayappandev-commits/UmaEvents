"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function LastSeen() {
  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", user.id);
    })();
  }, []);
  return null;
}
