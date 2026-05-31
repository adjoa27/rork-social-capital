import { ReactNode } from "react";

interface LegalSectionProps {
  title: string;
  children: ReactNode;
}

export const LegalSection = ({ title, children }: LegalSectionProps) => {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <h2 className="mb-3 text-lg font-semibold text-[hsl(var(--gold))]">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-foreground/70">{children}</div>
    </section>
  );
};

export const Bullets = ({ items }: { items: ReactNode[] }) => {
  return (
    <ul className="space-y-2 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-[hsl(var(--gold-soft))]">•</span>
          <span className="flex-1">{item}</span>
        </li>
      ))}
    </ul>
  );
};

export const Mail = ({ children }: { children: ReactNode }) => (
  <a
    href="mailto:hello@warmly.app"
    className="font-semibold text-[hsl(var(--gold))] hover:underline"
  >
    {children}
  </a>
);
