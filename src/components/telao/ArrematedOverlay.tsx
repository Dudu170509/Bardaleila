import { motion, AnimatePresence } from "framer-motion";
import { formatBRL } from "@/lib/auction-mock";

type Props = {
  show: boolean;
  winner: string;
  amount: number;
};

const CONFETTI = Array.from({ length: 40 }, (_, i) => i);
const COLORS = ["var(--cherry)", "var(--lime)", "var(--mango)", "var(--grape)", "var(--cream)"];

export function ArrematedOverlay({ show, winner, amount }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background/95 backdrop-blur-xl"
        >
          {/* confete */}
          {CONFETTI.map((i) => (
            <span
              key={i}
              className="absolute h-3 w-3 rounded-sm"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: "-10%",
                background: COLORS[i % COLORS.length],
                animation: `float-up ${2 + Math.random() * 2}s ${Math.random() * 1.5}s ease-out forwards`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.15 }}
            className="text-center"
          >
            <motion.p
              animate={{ rotate: [-3, 3, -3] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="font-display text-7xl font-extrabold uppercase text-party-gradient"
            >
              ARREMATOU!! 🎉
            </motion.p>
            <p className="mt-8 font-hand text-8xl text-cream neon-glow-lime">
              {winner}
            </p>
            <div className="mt-8 inline-block rotate-2 rounded-2xl bg-mango px-8 py-4 shadow-pop">
              <p className="font-display text-5xl font-extrabold text-background" style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatBRL(amount)}
              </p>
            </div>
            <p className="mt-6 font-hand text-3xl text-lime">vai pagar agora! 💸</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
