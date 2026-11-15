// Owner: Leonardo (Task LEO-02) — Shared Paper Mario cutout card component
import type { ReactNode } from "react";

interface PaperCardProps {
  children: ReactNode;
  className?: string;
  light?: boolean;
  title?: string;
  subtitle?: string;
  badge?: string;
  headerRight?: ReactNode;
}

export function PaperCard({
  children,
  className = "",
  light = false,
  title,
  subtitle,
  badge,
  headerRight,
}: PaperCardProps) {
  const hasHeader = Boolean(title || subtitle || badge || headerRight);

  return (
    <div className={`${light ? "paper-card-light" : "paper-card"} p-4 sm:p-5 ${className}`}>
      {hasHeader && (
        <div
          className={`mb-3 flex flex-wrap items-start justify-between gap-2 border-b-2 pb-3 ${
            light ? "border-ink-black/20" : "border-ink-black"
          }`}
        >
          <div className="space-y-0.5">
            {badge && (
              <span className="paper-badge mb-1 bg-paper-cream px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink-black">
                {badge}
              </span>
            )}
            {title && <h3 className="font-display text-lg font-bold">{title}</h3>}
            {subtitle && (
              <p className={`text-xs ${light ? "text-slate-600" : "text-slate-300"}`}>
                {subtitle}
              </p>
            )}
          </div>
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export default PaperCard;
