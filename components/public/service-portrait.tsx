"use client";

import Link from "next/link";
import { UmaButton } from "@/components/public/ui";
import { ServiceEnterLink } from "@/components/public/service-chapter";

export function ServiceActions({ slug }: { slug: string }) {
  return (
    <div className="uma-service-actions">
      <ServiceEnterLink slug={slug} className="uma-service-explore">
        View More
      </ServiceEnterLink>
      <UmaButton href="/contact" variant="secondary">
        Plan Your Event
      </UmaButton>
    </div>
  );
}

export function ServiceTitleLink({
  slug,
  className,
  children,
}: {
  slug: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (!slug) return <span className={className}>{children}</span>;
  return (
    <ServiceEnterLink slug={slug} className={className}>
      {children}
    </ServiceEnterLink>
  );
}

export function ServicesIndexLink({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <Link href="/services" className={className}>
      {children}
    </Link>
  );
}
