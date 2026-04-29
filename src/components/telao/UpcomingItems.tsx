import type { AuctionItem } from "@/lib/auction-mock";

export function UpcomingItems({ items }: { items: AuctionItem[] }) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-hand text-2xl text-mango">próximos →</span>
      <div className="flex gap-3">
        {items.map((it, idx) => (
          <div
            key={it.id}
            className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card/70 px-3 py-2 backdrop-blur"
            style={{ transform: `rotate(${idx % 2 === 0 ? -1 : 1}deg)` }}
          >
            <span className="text-2xl">{it.emoji}</span>
            <div>
              <p className="font-mono text-[9px] font-bold uppercase text-lime">
                Lote {it.order.toString().padStart(2, "0")}
              </p>
              <p className="font-display text-sm font-bold text-cream">{it.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
