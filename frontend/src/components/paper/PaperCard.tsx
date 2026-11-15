// Owner: Leonardo (Task LEO-02) — Shared Paper Mario cutout card component
import type { ReactNode } from "react";

interface PaperCardProps {
  children: ReactNode;
  className?: string;
  light?: boolean;
}

export function PaperCard({ children, className = "", light = false }: PaperCardProps) {
  return (
    <div className={`${light ? "paper-card-light" : "paper-card"} p-4 ${className}`}>
      {children}
    </div>
  );
}

export default PaperCard;
