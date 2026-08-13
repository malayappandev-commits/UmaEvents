"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ENQUIRY_STATUSES } from "@/lib/constants";
import { formatDateShort } from "@/lib/utils";
import type { Enquiry, EnquiryStatus } from "@/types";

export function EnquiriesBoard({ enquiries }: { enquiries: Enquiry[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [open, setOpen] = useState<Enquiry | null>(null);

  const filtered = useMemo(() => {
    return enquiries.filter((e) => {
      if (status !== "ALL" && e.status !== status) return false;
      if (!q) return true;
      const blob = `${e.name} ${e.email} ${e.phone} ${e.event_type} ${e.location} ${e.message}`.toLowerCase();
      return blob.includes(q.toLowerCase());
    });
  }, [enquiries, q, status]);

  async function updateStatus(id: string, next: EnquiryStatus) {
    const supabase = createClient();
    await supabase.from("enquiries").update({ status: next }).eq("id", id);
    router.refresh();
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search"
          className="border border-white/15 bg-transparent px-3 py-2 text-sm"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-white/15 bg-transparent px-3 py-2 text-sm">
          <option value="ALL" className="text-black">
            All statuses
          </option>
          {ENQUIRY_STATUSES.map((s) => (
            <option key={s} value={s} className="text-black">
              {s}
            </option>
          ))}
        </select>
      </div>
      <table className="mt-6 w-full min-w-[800px] text-left text-sm">
        <thead className="text-[11px] tracking-[0.16em] text-admin-muted uppercase">
          <tr>
            <th className="pb-3">Name</th>
            <th className="pb-3">Event</th>
            <th className="pb-3">Date</th>
            <th className="pb-3">Status</th>
            <th className="pb-3">Received</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((e) => (
            <tr key={e.id} className="border-t border-admin-line">
              <td className="py-3">
                <button type="button" className="text-left hover:text-gold" onClick={() => setOpen(e)}>
                  {e.name}
                </button>
              </td>
              <td>{e.event_type}</td>
              <td>{formatDateShort(e.event_date)}</td>
              <td>
                <select
                  value={e.status}
                  onChange={(ev) => void updateStatus(e.id, ev.target.value as EnquiryStatus)}
                  className="bg-transparent text-sm"
                >
                  {ENQUIRY_STATUSES.map((s) => (
                    <option key={s} value={s} className="text-black">
                      {s}
                    </option>
                  ))}
                </select>
              </td>
              <td className="text-admin-muted">{formatDateShort(e.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setOpen(null)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto bg-admin-panel p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-3xl">{open.name}</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div>Email: {open.email}</div>
              <div>Phone: {open.phone}</div>
              <div>Event: {open.event_type}</div>
              <div>Date: {formatDateShort(open.event_date)}</div>
              <div>Location: {open.location}</div>
              <div>Guests: {open.guest_count ?? "—"}</div>
              <div>Budget: {open.budget || "—"}</div>
              <div>Project: {open.project_id || "—"}</div>
              <div className="whitespace-pre-wrap pt-3">{open.message}</div>
            </dl>
          </div>
        </div>
      ) : null}
    </div>
  );
}
