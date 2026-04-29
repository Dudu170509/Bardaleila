import { motion, AnimatePresence } from "framer-motion";
import { formatBRL } from "@/lib/auction-mock";

type Props = {
  amount: number;
  leaderName: string;
  bidCount: number;
};

export function CurrentBidDisplay({ amount, leaderName, bidCount }: Props) {
  return (
    <div className="flex flex-col items-start gap-6">
      <div className="flex items-center gap-3">
        <span className="h-px w-12 bg-gold/60" />
        <span className="font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground">
          Lance atual
        </span>
      </div>

      <div className="relative">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={amount}
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="font-display text-[clamp(5rem,12vw,11rem)] font-light leading-none tracking-tight text-gold-gradient"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatBRL(amount)}
          </motion.div>
        </AnimatePresence>

        <motion.div
          key={`glow-${amount}`}
          initial={{ opacity: 0.6, scale: 0.9 }}
          animate={{ opacity: 0, scale: 1.4 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 -z-10 blur-3xl"
          style={{ background: "var(--gradient-gold)" }}
        />
      </div>

      <div className="mt-2 flex items-baseline gap-6 border-t border-border/40 pt-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            Líder
          </p>
          <AnimatePresence mode="popLayout">
            <motion.p
              key={leaderName}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="mt-1 font-display text-3xl italic text-ivory"
            >
              {leaderName}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="ml-auto text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            Lances
          </p>
          <p className="mt-1 font-mono text-3xl text-gold">{bidCount.toString().padStart(2, "0")}</p>
        </div>
      </div>
    </div>
  );
}
