"use client";

import { useState } from "react";
import { HomeIcon, SearchNavIcon, HeartIcon, CartIcon, ProfileIcon } from "@/components/icons";

export function BottomNav({ checkedCount }: { checkedCount: number }) {
  const [activeTab, setActiveTab] = useState<"home" | "search" | "saved" | "list" | "profile">("home");

  const tabs = [
    { id: "home" as const, label: "Home", icon: (active: boolean) => <HomeIcon active={active} /> },
    { id: "search" as const, label: "Search", icon: (active: boolean) => <SearchNavIcon active={active} /> },
    { id: "saved" as const, label: "Saved", icon: (active: boolean) => <HeartIcon active={active} /> },
    { id: "list" as const, label: "My List", icon: (active: boolean) => <CartIcon active={active} badgeCount={checkedCount} /> },
    { id: "profile" as const, label: "Profile", icon: (active: boolean) => <ProfileIcon active={active} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EDE8DF] z-20" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="max-w-2xl mx-auto flex justify-around py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-0"
            >
              {tab.icon(isActive)}
              <span className={`text-[10px] font-medium ${isActive ? "text-[#4A6741] font-semibold" : "text-[#9A9A9A]"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
