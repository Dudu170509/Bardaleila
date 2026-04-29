import { motion, AnimatePresence } from "framer-motion";
import type { Item } from "@/lib/auction-types";
import { formatBRL } from "@/lib/auction-types";

export function ItemStage({ item }: { item: Item }) {
  return (
    <div className="relative flex h-full items-center justify-center p-12">
      {/* gradient blur orb */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="h-[70%] w-[70%] rounded-full opacity-40 animate-spin-slow"
          style={{
            background:
              "conic-gradient(from 0deg, var(--cherry), var(--mango), var(--lime), var(--grape), var(--cherry))",
            filter: "blur(80px)",
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: -2 }}
          exit={{ opacity: 0, scale: 1.05, rotate: 6 }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
          className="relative aspect-square w-[70%] max-w-[480px]"
        >
          <div className="absolute -inset-3 rounded-3xl bg-lime" />
          <div className="absolute -inset-1.5 rounded-3xl bg-cherry" />
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border-4 border-cream bg-card">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-[14rem] leading-none">{item.emoji}</span>
            )}
          </div>

          {/* Lote sticker */}
          <div className="absolute -right-5 -top-5 z-10 flex h-20 w-20 rotate-12 items-center justify-center rounded-full bg-mango shadow-pop">
            <div className="text-center">
              <p className="font-mono text-[8px] font-bold uppercase text-background">Lote</p>
              <p className="font-display text-2xl font-extrabold leading-none text-background">
                {item.order.toString().padStart(2, "0")}
              </p>
            </div>
          </div>

          {/* floating emoji */}
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-6 -left-6 text-6xl drop-shadow-2xl"
          >
            {item.emoji}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* starting price sticker */}
      <div className="absolute bottom-8 right-8 -rotate-6 rounded-2xl bg-cream px-4 py-2 shadow-pop-grape">
        <p className="font-mono text-[9px] font-bold uppercase text-background">Começou em</p>
        <p className="font-display text-xl font-extrabold text-cherry">
          {formatBRL(item.starting_price)}
        </p>
      </div>
    </div>
  );
}
