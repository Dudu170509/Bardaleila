import { motion, AnimatePresence } from "framer-motion";
import { formatBRL } from "@/lib/auction-types";

export function CurrentBidDisplay({
  amount,
  leaderName,
  leaderAvatar,
  bidCount,
}: {
  amount: number;
  leaderName: string;
  leaderAvatar: string;
  bidCount: number;
}) {
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-cherry px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-cream">
          ◉ Lance atual
        </span>
        <span className="font-hand text-xl text-mango">tá subindo!</span>
      </div>

      <div className="relative">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={amount}
            initial={{ opacity: 0, y: 30, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: -20, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
            className="font-display font-extrabold leading-[0.85] tracking-tight neon-glow-mango"
            style={{
              fontVariantNumeric: "tabular-nums",
              color: "var(--mango)",
              fontSize: "clamp(4rem, 9vw, 8rem)",
            }}
          >
            {formatBRL(amount)}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-2 flex w-full items-stretch gap-3">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border-2 border-lime bg-card/60 px-4 py-2.5 backdrop-blur">
          <span className="text-3xl">{leaderAvatar}</span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-lime">
              Tá ganhando
            </p>
            <AnimatePresence mode="popLayout">
              <motion.p
                key={leaderName}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="truncate font-hand text-3xl font-bold text-cream"
              >
                {leaderName}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
        <div className="rounded-2xl border-2 border-grape bg-card/60 px-4 py-2.5 text-center backdrop-blur">
          <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-grape">
            Lances
          </p>
          <p className="font-display text-3xl font-extrabold text-cream">{bidCount}</p>
        </div>
      </div>
    </div>
  );
}
