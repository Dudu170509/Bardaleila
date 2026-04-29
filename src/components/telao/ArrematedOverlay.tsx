import { motion, AnimatePresence } from "framer-motion";
import { formatBRL } from "@/lib/auction-mock";

type Props = {
  show: boolean;
  winner: string;
  amount: number;
};

export function ArrematedOverlay({ show, winner, amount }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.2 }}
            className="text-center"
          >
            <p className="font-mono text-sm uppercase tracking-[0.6em] text-gold">
              ◆ Arrematado ◆
            </p>
            <p className="mt-8 font-display text-[clamp(4rem,10vw,9rem)] font-light italic leading-none text-gold-gradient">
              {winner}
            </p>
            <p className="mt-8 font-mono text-3xl text-ivory" style={{ fontVariantNumeric: "tabular-nums" }}>
              {formatBRL(amount)}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
