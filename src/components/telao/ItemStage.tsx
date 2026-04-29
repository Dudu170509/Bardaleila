import { motion, AnimatePresence } from "framer-motion";
import type { AuctionItem } from "@/lib/auction-mock";
import { formatBRL } from "@/lib/auction-mock";

export function ItemStage({ item }: { item: AuctionItem }) {
  return (
    <div className="relative flex h-full items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.94, filter: "blur(20px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.04, filter: "blur(20px)" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="vignette relative aspect-[4/5] w-[80%] max-w-[640px] overflow-hidden rounded-sm border-deco"
        >
          <img
            src={item.imageUrl}
            alt={item.title}
            width={1024}
            height={1024}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold/80">
              Lote n.º {item.order.toString().padStart(2, "0")}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute left-12 top-12 font-mono text-[10px] uppercase tracking-[0.5em] text-muted-foreground">
        ◆ Em pregão
      </div>
      <div className="absolute right-12 top-12 text-right">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          Lance inicial
        </p>
        <p className="mt-1 font-mono text-sm text-ivory/80">{formatBRL(item.startingPrice)}</p>
      </div>
    </div>
  );
}
