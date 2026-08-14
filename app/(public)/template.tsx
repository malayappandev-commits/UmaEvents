"use client";

import { PageTransition } from "@/components/public/page-transition";

export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
