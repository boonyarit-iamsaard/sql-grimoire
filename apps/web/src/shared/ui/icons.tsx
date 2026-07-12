import type { SVGProps } from "react";

// Hand-authored line icons in the drawn style of the SVG art (24px viewBox,
// round joins, ~1.8 stroke). They ink in `currentColor`, so each inherits the
// color of the button or heading it sits in — no OS emoji glyphs.
type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: Readonly<IconProps>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1.1em"
      height="1.1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Run Query — a filled play triangle. */
export function PlayIcon(props: Readonly<IconProps>) {
  return (
    <Icon fill="currentColor" stroke="none" {...props}>
      <path d="M8 5.4 L18.6 12 L8 18.6 Z" />
    </Icon>
  );
}

/** Submit Answer — a guild pennant on its pole. */
export function FlagIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path d="M6.5 3 V21" />
      <path
        d="M6.5 4.4 H17.6 L14.9 8 L17.6 11.6 H6.5 Z"
        fill="currentColor"
        stroke="none"
      />
    </Icon>
  );
}

/** Format — a quill/pencil. */
export function PenIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path d="M14.5 4.5 l5 5 -10.5 10.5 -5.5 0.5 0.5 -5.5 Z" />
      <path d="M12.8 6.2 l5 5" />
    </Icon>
  );
}

/** Hint — a candle-lamp. */
export function LampIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path d="M12 3 a6 6 0 0 1 3.6 10.8 c-0.9 0.7 -1.1 1.2 -1.1 2.4 h-5 c0 -1.2 -0.2 -1.7 -1.1 -2.4 A6 6 0 0 1 12 3 Z" />
      <path d="M10 19 h4" />
      <path d="M10.6 21 h2.8" />
    </Icon>
  );
}

/** Reset Database — a circular restore arrow. */
export function ResetIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path d="M18.4 12 a6.4 6.4 0 1 1 -1.9 -4.6" />
      <path d="M17 3.6 V7.6 H13" />
    </Icon>
  );
}

/** Schema heading — an unrolled scroll. */
export function ScrollIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path d="M7 4 h9 a2 2 0 0 1 2 2 v11 a2.5 2.5 0 0 0 2.5 2.5 H8 a2.5 2.5 0 0 1 -2.5 -2.5 V6 a2 2 0 0 1 1.5 -1.9 Z" />
      <path d="M9.5 8.5 h5" />
      <path d="M9.5 11.5 h5" />
      <path d="M9.5 14.5 h3" />
    </Icon>
  );
}

/** A ledger table marker. */
export function TableIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <rect x="4" y="5" width="16" height="14" rx="1.5" />
      <path d="M4 9.8 h16" />
      <path d="M4 14.4 h16" />
      <path d="M10 5 v14" />
      <path d="M15 5 v14" />
    </Icon>
  );
}

/** A warning triangle for SQL errors. */
export function WarningIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path d="M12 4 L21 19.5 H3 Z" />
      <path d="M12 10 v4.5" />
      <path d="M12 17.4 v0.1" />
    </Icon>
  );
}

/** An hourglass — the runaway-query "too slow" note. */
export function HourglassIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <path d="M7 4 h10" />
      <path d="M7 20 h10" />
      <path d="M7.5 4 c0 4.5 4.5 5.5 4.5 8 c0 -2.5 4.5 -3.5 4.5 -8" />
      <path d="M7.5 20 c0 -4.5 4.5 -5.5 4.5 -8 c0 2.5 4.5 3.5 4.5 8" />
    </Icon>
  );
}
