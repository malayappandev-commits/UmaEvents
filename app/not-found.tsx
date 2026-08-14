import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-ivory px-6 text-center">
      <p className="uma-eyebrow">404</p>
      <h1 className="uma-section-title mt-4">This page is not here</h1>
      <Link href="/" className="uma-btn uma-btn-ghost mt-8">
        <span>Return home</span>
        <span className="uma-btn-arrow" aria-hidden>
          →
        </span>
      </Link>
    </main>
  );
}
