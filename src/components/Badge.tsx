import React from "react";

type BadgeVariant = "default" | "permitted" | "blocked" | "warning" | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default:
    "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border)]",
  permitted:
    "bg-[var(--success-bg)] text-[var(--success)] border-transparent",
  blocked:
    "bg-[var(--danger-bg)] text-[var(--danger)] border-transparent",
  warning:
    "bg-amber-950/20 text-amber-500 border-transparent",
  info:
    "bg-blue-950/20 text-blue-400 border-transparent",
};

export default function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-[var(--radius-sm)] px-2.5 py-1 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
