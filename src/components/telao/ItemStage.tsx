import { motion, AnimatePresence } from "framer-motion";
import type { AuctionItem } from "@/lib/auction-mock";
import { formatBRL } from "@/lib/auction-mock";

export function ItemStage({ item }: { item: AuctionItem }) {
  return (
    <div className="relative flex h-full items-center justify-center p-8">
      {/* círculo decorativo girando atrás */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="h-[80%] w-[80%] rounded-full opacity-40 animate-spin-slow"
          style={{
            background: "conic-gradient(from 0deg, var(--cherry), var(--mango), var(--lime), var(--grape), var(--cherry))",
            filter: "blur(80px)",
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: -3 }}
          exit={{ opacity: 0, scale: 1.1, rotate: 8 }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
          className="relative aspect-square w-[75%] max-w-[600px]"
        >
          {/* moldura colorida */}
          <div className="absolute -inset-4 rounded-3xl bg-lime" />
          <div className="absolute -inset-2 rounded-3xl bg-cherry" />
          <div className="relative aspect-square overflow-hidden rounded-3xl border-4 border-cream">
            <img
              src={item.imageUrl}
              alt={item.title}
              width={1024}
              height={1024}
              className="h-full w-full object-cover"
            />
          </div>

          {/* sticker do lote */}
          <div className="absolute -right-6 -top-6 z-10 flex h-24 w-24 rotate-12 items-center justify-center rounded-full bg-mango shadow-pop">
            <div className="text-center">
              <p className="font-mono text-[9px] font-bold uppercase text-background">Lote</p>
              <p className="font-display text-3xl font-extrabold leading-none text-background">
                {item.order.toString().padStart(2, "0")}
              </p>
            </div>
          </div>

          {/* emoji grande flutuante */}
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-8 -left-8 text-7xl drop-shadow-2xl"
          >
            {item.emoji}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* preço inicial — sticker rodapé */}
      <div className="absolute bottom-12 right-12 -rotate-6 rounded-2xl bg-cream px-5 py-3 shadow-pop-grape">
        <p className="font-mono text-[10px] font-bold uppercase text-background">Começou em</p>
        <p className="font-display text-2xl font-extrabold text-cherry">
          {formatBRL(item.startingPrice)}
        </p>
      </div>
    </div>
  );
}
