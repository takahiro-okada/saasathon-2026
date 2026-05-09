"use client";

import { BlobShape, CherryBlossomBranch, WavePattern, BowlIcon, FernLeafIcon } from "@/components/icons";

export function WelcomePage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 bg-[#F7F3EC] overflow-hidden">
      <BlobShape />
      <CherryBlossomBranch />
      <WavePattern />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-3">
          <BowlIcon />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#2D2D2D]">ShopMate</h1>
            <p className="text-sm text-[#5A5A5A] mt-1">Cook with confidence in New Zealand</p>
          </div>
        </div>

        <div className="w-full space-y-3">
          <div className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm border border-[#EDE8DF]">
            <div className="shrink-0 w-10 h-10 rounded-full bg-[#E8F0E5] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="7" stroke="#4A6741" strokeWidth="2" />
                <path d="M16.5 16.5L21 21" stroke="#4A6741" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#2D2D2D]">Find ingredients instantly</p>
              <p className="text-xs text-[#5A5A5A] mt-0.5">See what you need for any recipe, in seconds.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm border border-[#EDE8DF]">
            <div className="shrink-0 w-10 h-10 rounded-full bg-[#E8F0E5] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2L3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6L18 2H6Z" stroke="#4A6741" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M3 6H21" stroke="#4A6741" strokeWidth="2" strokeLinecap="round" />
                <path d="M16 10C16 12.21 14.21 14 12 14C9.79 14 8 12.21 8 10" stroke="#4A6741" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#2D2D2D]">Know what to buy</p>
              <p className="text-xs text-[#5A5A5A] mt-0.5">Clear photos and English names so you can shop with ease.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm border border-[#EDE8DF]">
            <div className="shrink-0 w-10 h-10 rounded-full bg-[#E8F0E5] flex items-center justify-center">
              <FernLeafIcon />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#2D2D2D]">Smart swaps &amp; best prices</p>
              <p className="text-xs text-[#5A5A5A] mt-0.5">Get substitutes for hard-to-find items and the cheapest total across NZ supermarkets.</p>
            </div>
          </div>
        </div>

        <button
          onClick={onGetStarted}
          className="w-full bg-[#4A6741] hover:bg-[#3D5736] text-white rounded-full py-4 text-lg font-semibold transition-colors shadow-md"
        >
          Get Started
        </button>

        <p className="text-sm text-[#9A9A9A]">
          Already have an account?{" "}
          <span className="text-[#4A6741] font-medium cursor-pointer hover:underline">Log in</span>
        </p>
      </div>
    </div>
  );
}
