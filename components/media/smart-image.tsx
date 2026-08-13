import Image from "next/image";
import { cn } from "@/lib/utils";

export function SmartImage({
  src,
  alt,
  className,
  sizes = "100vw",
  priority = false,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) {
    return <div className={cn("bg-charcoal/10", className)} aria-hidden />;
  }

  const unoptimized = src.includes("token=") || src.includes("sign");

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={unoptimized}
      className={cn("object-cover", className)}
    />
  );
}
