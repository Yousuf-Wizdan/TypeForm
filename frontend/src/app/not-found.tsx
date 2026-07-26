export const dynamic = "force-dynamic";

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
};

export default function NotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f7f7f6] flex items-center justify-center" style={{ fontFamily: "system-ui, sans-serif" }}>
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-zinc-200">404</h1>
          <p className="text-zinc-500 text-lg">This page could not be found.</p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-[#7c5cfc] text-white text-sm font-semibold hover:bg-[#6a4be8] transition-colors"
          >
            Go home
          </Link>
        </div>
      </body>
    </html>
  );
}