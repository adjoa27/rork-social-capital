import { Link } from "react-router-dom";
import { Scale, ShieldCheck, Heart, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-[hsl(var(--gold)/0.25)] bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))]">
          <Heart size={36} strokeWidth={2.2} fill="currentColor" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Social Capital</h1>
        <p className="mt-3 text-muted-foreground">
          Keep your relationships warm. Legal information for the Social Capital app.
        </p>

        <div className="mt-10 space-y-3">
          <Link
            to="/terms"
            className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition-colors hover:border-[hsl(var(--gold)/0.4)] hover:bg-white/[0.08]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))]">
              <Scale size={22} strokeWidth={2.2} />
            </div>
            <div className="flex-1">
              <div className="font-semibold">Terms of Service</div>
              <div className="text-sm text-muted-foreground">Usage, subscriptions & billing</div>
            </div>
            <ArrowRight
              size={18}
              className="text-muted-foreground transition-transform group-hover:translate-x-1"
            />
          </Link>

          <Link
            to="/privacy"
            className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition-colors hover:border-[hsl(var(--gold)/0.4)] hover:bg-white/[0.08]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))]">
              <ShieldCheck size={22} strokeWidth={2.2} />
            </div>
            <div className="flex-1">
              <div className="font-semibold">Privacy Policy</div>
              <div className="text-sm text-muted-foreground">How we handle your data</div>
            </div>
            <ArrowRight
              size={18}
              className="text-muted-foreground transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        <p className="mt-12 text-sm text-muted-foreground opacity-60">
          © {new Date().getFullYear()} Social Capital. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Index;
