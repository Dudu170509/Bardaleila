import type { Item } from "@/lib/auction-types";

export function UpcomingItems({ items }: { items: Item[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="font-hand text-xl text-mango">próximos →</span>
      <div className="flex gap-2">
        {items.slice(0, 3).map((it, idx) => (
          <div
            key={it.id}
            className="flex items-center gap-2 rounded-xl border-2 border-border bg-card/70 px-2.5 py-1.5 backdrop-blur"
            style={{ transform: `rotate(${idx % 2 === 0 ? -1 : 1}deg)` }}
          >
            <span className="text-xl">{it.emoji}</span>
            <div>
              <p className="font-mono text-[8px] font-bold uppercase text-lime">
                Lote {it.order.toString().padStart(2, "0")}
              </p>
              <p className="font-display text-xs font-bold text-cream">{it.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
