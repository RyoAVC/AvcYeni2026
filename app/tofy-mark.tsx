type TofyMarkProps = {
  className?: string;
  talking?: boolean;
  listening?: boolean;
};

export function TofyMark({ className, talking, listening }: TofyMarkProps) {
  const state = listening ? " is-listening" : talking ? " is-talking" : "";
  return (
    <svg
      className={`tofy-mark${state}${className ? ` ${className}` : ""}`}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Tofy"
    >
      <defs>
        <linearGradient id="tofy-shell" x1="8" y1="10" x2="40" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="currentColor" stopOpacity=".16" />
          <stop offset="1" stopColor="currentColor" stopOpacity=".04" />
        </linearGradient>
      </defs>
      <rect className="tofy-shell" x="7" y="11" width="34" height="26" rx="11" fill="url(#tofy-shell)" stroke="currentColor" strokeWidth="1.25" />
      <rect className="tofy-visor" x="12" y="18" width="24" height="11" rx="5.5" fill="var(--ink)" />
      <rect className="tofy-eye" x="17.5" y="20.5" width="3" height="6" rx="1.5" fill="var(--mint)" />
      <rect className="tofy-eye" x="27.5" y="20.5" width="3" height="6" rx="1.5" fill="var(--mint)" />
      <path className="tofy-antenna" d="M24 8.5V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle className="tofy-signal" cx="24" cy="7" r="2.25" fill="var(--mint)" />
      <circle className="tofy-status" cx="35.5" cy="14.5" r="2.25" fill="var(--brand-red)" />
    </svg>
  );
}
