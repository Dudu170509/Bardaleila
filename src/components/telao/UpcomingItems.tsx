import type { AuctionItem } from "@/lib/auction-mock";

export function UpcomingItems({ items }: { items: AuctionItem[] }) {
  return (
    <div className="flex items-center gap-6">
      <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
        A seguir
      </span>
      <div className="flex gap-4">
        {items.map((it) => (
          <div
            key={it.id}
            className="flex items-center gap-3 rounded-sm border border-border/40 bg-card/40 px-3 py-2 backdrop-blur"
          >
            <img
              src={it.imageUrl}
              alt=""
              className="h-10 w-10 rounded-sm object-cover opacity-70"
              loading="lazy"
            />
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                Lote {it.order.toString().padStart(2, "0")}
              </p>
              <p className="font-display text-sm text-ivory/90">{it.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
