export default function ThreadMark({ className = "w-8 h-8", animate = false }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4 30 C 10 30, 10 18, 16 18 C 22 18, 22 30, 28 30 C 32 30, 32 24, 36 24"
        stroke="var(--gold)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1 6"
        className={animate ? "thread-draw" : ""}
      />
      <circle cx="16" cy="18" r="2.4" fill="var(--gold)" />
      <path
        d="M28 8 L28 22 M24 11 L32 11"
        stroke="var(--paper)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
