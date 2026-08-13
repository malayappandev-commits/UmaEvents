import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-ivory px-6 text-center">
      <p className="text-[11px] tracking-[0.32em] text-earth uppercase">404</p>
      <h1 className="mt-4 font-serif text-5xl">This page is not here</h1>
      <Link href="/" className="mt-8 text-[11px] tracking-[0.28em] uppercase text-earth">
        Return home
      </Link>
    </main>
  );
}
