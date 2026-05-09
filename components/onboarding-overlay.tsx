"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ONBOARDING_STEPS } from "@/constants/onboarding";

export function OnboardingOverlay({
  step,
  onNext,
  onSkip,
}: {
  step: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [tooltipHeight, setTooltipHeight] = useState(200);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const padding = 8;
  const stepConfig = ONBOARDING_STEPS[step];

  const updateRect = useCallback(() => {
    if (!stepConfig) return;
    const el = document.querySelector(`[data-onboarding="${stepConfig.target}"]`);
    if (el) {
      setRect(el.getBoundingClientRect());
    }
  }, [stepConfig]);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      updateRect();
    });
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect);
    return () => {
      cancelAnimationFrame(timer);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, [updateRect]);

  useEffect(() => {
    if (tooltipRef.current) {
      setTooltipHeight(tooltipRef.current.getBoundingClientRect().height);
    }
  }, [step, rect]);

  if (!rect || !stepConfig) return null;

  const isLastStep = step === ONBOARDING_STEPS.length - 1;
  const tooltipWidth = 320;
  const targetCenterX = rect.left + rect.width / 2;
  const tooltipLeft = Math.max(16, Math.min(targetCenterX - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16));

  const spotlightTop = rect.top - padding;
  const spotlightLeft = rect.left - padding;
  const spotlightWidth = rect.width + padding * 2;
  const spotlightHeight = rect.height + padding * 2;

  let tooltipTop =
    stepConfig.position === "below"
      ? rect.bottom + padding + 16
      : rect.top - padding - 16 - tooltipHeight;

  if (tooltipTop < 16) tooltipTop = 16;
  if (tooltipTop + tooltipHeight > window.innerHeight - 16)
    tooltipTop = window.innerHeight - tooltipHeight - 16;

  const arrowIsAbove = stepConfig.position === "below";
  const arrowLeft = Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipLeft - 10, tooltipWidth - 32));

  return (
    <>
      <div
        className="fixed z-50 transition-all duration-300 ease-in-out"
        style={{
          top: spotlightTop,
          left: spotlightLeft,
          width: spotlightWidth,
          height: spotlightHeight,
          borderRadius: 12,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
          animation: "spotlight-pulse 2s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      <div
        ref={tooltipRef}
        className="fixed z-50 bg-white rounded-2xl shadow-lg p-5 transition-all duration-300"
        style={{
          top: tooltipTop,
          left: tooltipLeft,
          width: tooltipWidth,
          pointerEvents: "auto",
        }}
      >
        {arrowIsAbove ? (
          <div
            className="absolute w-0 h-0"
            style={{
              top: -10,
              left: arrowLeft,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderBottom: "10px solid white",
            }}
          />
        ) : (
          <div
            className="absolute w-0 h-0"
            style={{
              bottom: -10,
              left: arrowLeft,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: "10px solid white",
            }}
          />
        )}

        <p className="text-xs font-medium text-[#8BAF7E] mb-1">
          {step + 1} / {ONBOARDING_STEPS.length}
        </p>
        <h3 className="font-semibold text-lg text-[#2D2D2D] mb-1">{stepConfig.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{stepConfig.description}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={onSkip}
            className="text-[#9A9A9A] hover:text-[#5A5A5A] text-sm transition-colors"
          >
            Skip
          </button>
          <button
            onClick={onNext}
            className="bg-[#4A6741] text-white rounded-full px-6 py-2 text-sm font-semibold hover:bg-[#3D5736] transition-colors"
          >
            {isLastStep ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </>
  );
}
