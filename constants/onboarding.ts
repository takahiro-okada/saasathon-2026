import type { OnboardingStep } from "@/types";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    target: "step-1",
    title: "Search for any dish",
    description: "Type a Japanese dish name in English or Japanese — we'll find the ingredients you need.",
    position: "below",
  },
  {
    target: "step-2",
    title: "Pick your supermarket",
    description: "Choose which store to check prices at. We'll show real-time availability and pricing.",
    position: "below",
  },
  {
    target: "step-3",
    title: "Try popular recipes",
    description: "Not sure what to cook? Pick from our most popular Japanese dishes to get started.",
    position: "below",
  },
  {
    target: "step-4",
    title: "Find stores near you",
    description: "See which supermarkets are closest to you and compare distances.",
    position: "below",
  },
  {
    target: "step-5",
    title: "Navigate the app",
    description: "Use the bottom bar to switch between Home, Search, your Saved recipes, Shopping List, and Profile.",
    position: "above",
  },
];
