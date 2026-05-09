"use client";

export function BlobShape() {
  return (
    <svg
      className="absolute top-0 left-0 w-48 h-48 opacity-80"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#EDE8DF"
        d="M44.2,-56.8C56.3,-46.2,64,-30.2,67.1,-13.2C70.2,3.8,68.7,21.7,60.5,35.5C52.3,49.3,37.4,59,20.8,65.1C4.2,71.2,-14.1,73.7,-28.7,67.4C-43.3,61.1,-54.2,46.1,-61.2,29.4C-68.2,12.7,-71.4,-5.7,-66.5,-21.6C-61.7,-37.5,-48.9,-51,-34.4,-60.9C-19.9,-70.8,-3.7,-77.1,10.8,-74.8C25.3,-72.5,32.1,-67.4,44.2,-56.8Z"
        transform="translate(80 80)"
      />
    </svg>
  );
}

export function CherryBlossomBranch() {
  return (
    <svg
      className="absolute top-2 left-2 w-44 h-44 opacity-90"
      viewBox="0 0 180 180"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10 170 Q50 120 80 80 Q100 50 120 20" stroke="#8BAF7E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M60 110 Q75 90 90 75" stroke="#8BAF7E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M40 140 Q55 125 65 110" stroke="#8BAF7E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <g transform="translate(120, 20)">
        <circle cx="0" cy="-8" r="5" fill="#D4A0A0" opacity="0.85" />
        <circle cx="7.6" cy="-2.5" r="5" fill="#D4A0A0" opacity="0.85" />
        <circle cx="4.7" cy="7" r="5" fill="#D4A0A0" opacity="0.85" />
        <circle cx="-4.7" cy="7" r="5" fill="#D4A0A0" opacity="0.85" />
        <circle cx="-7.6" cy="-2.5" r="5" fill="#D4A0A0" opacity="0.85" />
        <circle cx="0" cy="0" r="3" fill="#F5E6E6" />
      </g>
      <g transform="translate(90, 75)">
        <circle cx="0" cy="-7" r="4.5" fill="#D4A0A0" opacity="0.8" />
        <circle cx="6.7" cy="-2.2" r="4.5" fill="#D4A0A0" opacity="0.8" />
        <circle cx="4.1" cy="6" r="4.5" fill="#D4A0A0" opacity="0.8" />
        <circle cx="-4.1" cy="6" r="4.5" fill="#D4A0A0" opacity="0.8" />
        <circle cx="-6.7" cy="-2.2" r="4.5" fill="#D4A0A0" opacity="0.8" />
        <circle cx="0" cy="0" r="2.5" fill="#F5E6E6" />
      </g>
      <g transform="translate(65, 110)">
        <circle cx="0" cy="-6" r="4" fill="#D4A0A0" opacity="0.75" />
        <circle cx="5.7" cy="-1.9" r="4" fill="#D4A0A0" opacity="0.75" />
        <circle cx="3.5" cy="5.1" r="4" fill="#D4A0A0" opacity="0.75" />
        <circle cx="-3.5" cy="5.1" r="4" fill="#D4A0A0" opacity="0.75" />
        <circle cx="-5.7" cy="-1.9" r="4" fill="#D4A0A0" opacity="0.75" />
        <circle cx="0" cy="0" r="2" fill="#F5E6E6" />
      </g>
      <ellipse cx="150" cy="50" rx="5" ry="3" fill="#D4A0A0" opacity="0.5" transform="rotate(-30 150 50)" />
    </svg>
  );
}

export function WavePattern() {
  const svgString = `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='20'><path d='M0 20 Q10 0 20 20 Q30 0 40 20' fill='none' stroke='%23EDE8DF' stroke-width='1.5'/></svg>`;
  const dataUri = `data:image/svg+xml,${svgString}`;
  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-24 opacity-60"
      style={{
        backgroundImage: `url("${dataUri}")`,
        backgroundRepeat: "repeat-x",
        backgroundPosition: "bottom",
        backgroundSize: "40px 20px",
      }}
    />
  );
}

export function BowlIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 14 Q22 8 20 2" stroke="#4A6741" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M32 12 Q34 6 32 0" stroke="#4A6741" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M44 14 Q46 8 44 2" stroke="#4A6741" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M8 28 Q8 52 32 52 Q56 52 56 28 Z" fill="#4A6741" opacity="0.15" />
      <path d="M8 28 Q8 52 32 52 Q56 52 56 28" stroke="#4A6741" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="32" cy="28" rx="24" ry="6" stroke="#4A6741" strokeWidth="2.5" fill="white" />
      <path d="M22 52 L26 58 L38 58 L42 52" stroke="#4A6741" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="26" y1="58" x2="38" y2="58" stroke="#4A6741" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function FernLeafIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 18 Q10 10 10 2" stroke="#4A6741" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 14 Q7 11 4 12" stroke="#4A6741" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M10 10 Q13 7 16 8" stroke="#4A6741" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M10 6 Q8 3 6 4" stroke="#4A6741" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M10 16 Q13 13 15 14" stroke="#4A6741" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M10 12 Q8 9 5 9" stroke="#4A6741" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z"
        fill={active ? "#4A6741" : "none"}
        stroke={active ? "#4A6741" : "#9A9A9A"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SearchNavIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="11"
        cy="11"
        r="7"
        fill={active ? "#4A6741" : "none"}
        stroke={active ? "#4A6741" : "#9A9A9A"}
        strokeWidth="1.8"
      />
      <path d="M16.5 16.5L21 21" stroke={active ? "#4A6741" : "#9A9A9A"} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.08C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 14.5 14 21 12 21Z"
        fill={active ? "#4A6741" : "none"}
        stroke={active ? "#4A6741" : "#9A9A9A"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CartIcon({ active, badgeCount }: { active: boolean; badgeCount: number }) {
  return (
    <div className="relative">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6 2L3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6L18 2H6Z"
          fill={active ? "#4A6741" : "none"}
          stroke={active ? "#4A6741" : "#9A9A9A"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M3 6H21" stroke={active ? "#4A6741" : "#9A9A9A"} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M16 10C16 12.21 14.21 14 12 14C9.79 14 8 12.21 8 10" stroke={active ? "white" : "#9A9A9A"} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
      {badgeCount >= 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#4A6741] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
          {badgeCount}
        </span>
      )}
    </div>
  );
}

export function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="12"
        cy="8"
        r="4"
        fill={active ? "#4A6741" : "none"}
        stroke={active ? "#4A6741" : "#9A9A9A"}
        strokeWidth="1.8"
      />
      <path
        d="M4 20C4 17.79 7.58 16 12 16C16.42 16 20 17.79 20 20"
        stroke={active ? "#4A6741" : "#9A9A9A"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
