import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

export function UmaButton({
  href,
  children,
  variant = "primary",
  className,
  type,
}: {
  href?: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  type?: "button" | "submit";
}) {
  const classes = cn(
    "uma-btn",
    variant === "primary" && "uma-btn-primary",
    variant === "secondary" && "uma-btn-secondary",
    variant === "ghost" && "uma-btn-ghost",
    className,
  );
  const inner = (
    <>
      <span>{children}</span>
      <span className="uma-btn-arrow" aria-hidden>
        →
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button type={type ?? "button"} className={classes}>
      {inner}
    </button>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("uma-eyebrow", className)}>{children}</p>;
}

export function GoldLine({ className }: { className?: string }) {
  return <div className={cn("uma-gold-line", className)} role="presentation" />;
}

export function Ornament({ className }: { className?: string }) {
  return (
    <div className={cn("uma-ornament", className)} role="presentation">
      <span />
      <span />
      <span />
    </div>
  );
}

export function RadialGlow({ className }: { className?: string }) {
  return <div className={cn("uma-radial-glow", className)} aria-hidden />;
}

export function CinematicGradient({ className }: { className?: string }) {
  return <div className={cn("uma-cinematic-gradient", className)} aria-hidden />;
}

export function Quote({ children, className }: { children: ReactNode; className?: string }) {
  return <blockquote className={cn("uma-quote", className)}>{children}</blockquote>;
}
