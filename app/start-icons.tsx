type IconName =
  | "cart"
  | "store"
  | "plug"
  | "layers"
  | "headset"
  | "phone"
  | "target"
  | "lock"
  | "card"
  | "plane"
  | "gear"
  | "star"
  | "clap"
  | "cursor";

const PATHS: Record<IconName, string> = {
  cart: "M4 5h2l1.2 8.2A2 2 0 0 0 9.2 15h7.6a2 2 0 0 0 2-1.6L20 8H8M9 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  store: "M4 9 6 4h12l2 5M4 9h16v10H4V9Zm4 4h4v6H8v-6Z",
  plug: "M8 3v5M16 3v5M7 8h10v4a5 5 0 0 1-10 0V8Zm5 9v4",
  layers: "M4 8l8-4 8 4-8 4-8-4Zm0 5 8 4 8-4M4 16l8 4 8-4",
  headset: "M5 13a7 7 0 0 1 14 0v5a2 2 0 0 1-2 2h-2v-6h4M5 18h2v-6H5v6Zm7 3h2",
  phone: "M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 15h8",
  target: "M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm0 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 3.5a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1Z",
  lock: "M8 11V8a4 4 0 1 1 8 0v3M6 11h12v9H6v-9Zm6 3v3",
  card: "M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Zm0 3h16M7 15h4",
  plane: "M3 12h18L8 5v3l5 4-5 4v3l13-7",
  gear: "M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7ZM12 3v2M12 19v2M4.2 7.2l1.5 1.5M18.3 15.3l1.5 1.5M4.2 16.8l1.5-1.5M18.3 8.7l1.5-1.5",
  star: "M12 3.5 14.4 9l6 .5-4.6 3.8 1.5 5.7L12 16.2 6.7 19l1.5-5.7L3.6 9.5 9.6 9 12 3.5Z",
  clap: "M8 11 6 9.2a1.4 1.4 0 0 1 2-2L10 9m2 1.2-2.2-2.4a1.4 1.4 0 0 1 2.1-1.9L14 8.2m1.2 2.2-1.6-2.8a1.3 1.3 0 1 1 2.3-1.3L18 9m-7.2 3.4 6.4 6.2a3.2 3.2 0 0 1-4.4 4.6L7 17.4",
  cursor: "M5 4 18 13l-6 .2 2.6 6.4-2.4 1L9.4 14 5 17V4Z",
};

export function StartIcon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={PATHS[name]}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const STEP_ICONS = ["cart", "store", "plug"] as const;
export const FEATURE_ICONS = [
  "layers",
  "headset",
  "phone",
  "target",
  "lock",
  "card",
  "plane",
  "gear",
] as const;
