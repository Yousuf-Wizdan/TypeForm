"use client";

import React from "react";

export const FooterSection: React.FC = () => {
  return (
    <footer className="bg-[#1a1a1a] py-16 text-zinc-400">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 space-y-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
            >
              <rect width="32" height="32" rx="8" fill="#7c5cfc" />
              <path
                d="M10 12h5v8h-5zM17 10h5v10h-5z"
                fill="white"
                fillOpacity="0.9"
              />
            </svg>
            <span className="text-base font-bold text-white tracking-tight">
              typeform
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            {["Next.js 15", "React 19", "Tailwind v4", "FastAPI"].map(
              (tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-zinc-400"
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </div>

        <div className="h-px w-full bg-white/[0.08]" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-zinc-500 gap-4">
          <p>&copy; {new Date().getFullYear()} Typeform Clone. All rights reserved.</p>
          <p className="font-medium">
            Made by Yousuf Wizdan
          </p>
        </div>
      </div>
    </footer>
  );
};
