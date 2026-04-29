import { motion, AnimatePresence } from "framer-motion";
import { formatBRL } from "@/lib/auction-mock";

type Props = {
  amount: number;
  leaderName: string;
  bidCount: number;
};

export function CurrentBidDisplay({ amount, leaderName, bidCount }: Props) {
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-cherry px-4 py-1 font-mono text-xs font-bold uppercase tracking-wider text-cream">
          ◉ Lance atual
        </span>
        <span className="font-hand text-2xl text-mango">tá subindo!</span>
      </div>

      <div className="relative">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={amount}
            initial={{ opacity: 0, y: 40, scale: 0.85, rotate: -3 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: -30, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
            className="font-display text-[clamp(6rem,14vw,13rem)] font-extrabold leading-none tracking-tight neon-glow-mango"
            style={{ fontVariantNumeric: "tabular-nums", color: "var(--mango)" }}
          >
            {formatBRL(amount)}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex w-full items-center gap-4">
        <div className="flex-1 rounded-2xl border-4 border-lime bg-card/60 px-5 py-3 backdrop-blur sticker">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-lime">
            Tá ganhando
          </p>
          <AnimatePresence mode="popLayout">
            <motion.p
              key={leaderName}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="font-hand text-4xl font-bold text-cream"
            >
              {leaderName} 🔥
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="rounded-2xl border-4 border-grape bg-card/60 px-5 py-3 text-center backdrop-blur">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-grape">
            Lances
          </p>
          <p className="font-display text-4xl font-extrabold text-cream">
            {bidCount}
          </p>
        </div>
      </div>
    </div>
  );
}
