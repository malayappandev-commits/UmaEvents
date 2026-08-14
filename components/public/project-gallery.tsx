"use client";

import { useState } from "react";

type Item = {
  id: string;
  filename: string;
  displayUrl: string | null;
  fullUrl: string | null;
};

export function ProjectGallery({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <div className="mt-10 columns-1 gap-3 sm:columns-2 lg:columns-3">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setOpen(i)}
            className="uma-hover-zoom mb-3 block w-full"
          >
            {item.displayUrl || item.fullUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.displayUrl || item.fullUrl || ""}
                alt={item.filename}
                className="w-full object-cover"
              />
            ) : (
              <div className="aspect-[4/5] bg-cream" />
            )}
          </button>
        ))}
      </div>
      {open !== null && items[open] ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/90 p-4"
          onClick={() => setOpen(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={items[open].fullUrl || items[open].displayUrl || ""}
            alt={items[open].filename}
            className="max-h-[90vh] max-w-full object-contain"
          />
        </div>
      ) : null}
    </>
  );
}
