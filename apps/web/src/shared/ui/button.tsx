import type { ButtonHTMLAttributes, Ref } from "react";
import { cn } from "../../lib/cn";

type ButtonVariant = "default" | "primary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  ref?: Ref<HTMLButtonElement>;
}

const baseClasses =
  "inline-block rounded-lg border-2 px-[22px] py-2.5 font-display text-base tracking-[0.04em] transition-[transform,box-shadow,filter] duration-[120ms] enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 motion-safe:enabled:hover:-translate-y-px motion-safe:enabled:active:translate-y-px";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "border-ctp-overlay0 bg-linear-to-b from-ctp-surface1 to-ctp-surface0 text-ctp-text shadow-[0_2px_0_var(--color-ctp-crust),var(--shadow-paper)] enabled:active:shadow-[0_0_0_var(--color-ctp-crust),var(--shadow-paper)]",
  primary:
    "border-[#a98f52] bg-linear-to-b from-[#f2dcae] to-ctp-yellow text-ctp-crust shadow-[0_2px_0_#a98f52,var(--shadow-paper)] enabled:active:shadow-[0_0_0_#a98f52,var(--shadow-paper)]",
  danger:
    "border-[#a95863] bg-linear-to-b from-[#f09aa7] to-ctp-red text-ctp-crust shadow-[0_2px_0_#a95863,var(--shadow-paper)] enabled:active:shadow-[0_0_0_#a95863,var(--shadow-paper)]",
  ghost: "border-ctp-surface2 bg-transparent text-ctp-subtext1 shadow-none",
};

export function Button({
  variant = "default",
  className,
  ...props
}: Readonly<ButtonProps>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(baseClasses, variantClasses[variant], className)}
    />
  );
}
