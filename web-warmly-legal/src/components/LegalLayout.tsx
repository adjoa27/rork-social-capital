import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface LegalLayoutProps {
  icon: ReactNode;
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

const LegalLayout = ({ icon, title, lastUpdated, children }: LegalLayoutProps) => {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
        <Link
          to="/"
          className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} strokeWidth={2.4} />
          Back to Social Capital
        </Link>

        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[hsl(var(--gold)/0.25)] bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))]">
            {icon}
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{lastUpdated}</p>
        </div>

        <div className="space-y-4">{children}</div>

        <footer className="mt-14 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-3">
            <Link to="/terms" className="transition-colors hover:text-[hsl(var(--gold))]">
              Terms of Service
            </Link>
            <span className="opacity-40">·</span>
            <Link to="/privacy" className="transition-colors hover:text-[hsl(var(--gold))]">
              Privacy Policy
            </Link>
          </div>
          <p className="mt-4 opacity-60">© {new Date().getFullYear()} Social Capital. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default LegalLayout;
