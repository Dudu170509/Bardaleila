import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Auction, Item, Bid, Participant } from "@/lib/auction-types";

export function useAuctionState() {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [a, i, b, p] = await Promise.all([
      supabase.from("auctions").select("*").limit(1).maybeSingle(),
      supabase.from("items").select("*").order("order", { ascending: true }),
      supabase.from("bids").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("participants").select("*"),
    ]);
    if (a.data) setAuction(a.data as Auction);
    if (i.data) setItems(i.data as Item[]);
    if (b.data) setBids(b.data as Bid[]);
    if (p.data) setParticipants(p.data as Participant[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const ch = supabase
      .channel("auction-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "auctions" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "items" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "bids" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "participants" }, refresh)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [refresh]);

  const currentItem = items.find((it) => it.id === auction?.current_item_id) ?? null;
  const currentBids = currentItem ? bids.filter((b) => b.item_id === currentItem.id) : [];
  const topBid = currentBids[0] ?? null;
  const leader = topBid ? participants.find((p) => p.id === topBid.participant_id) ?? null : null;

  return {
    auction,
    items,
    bids,
    participants,
    loading,
    currentItem,
    currentBids,
    topBid,
    leader,
    refresh,
  };
}

export function useParticipantSession() {
  const [me, setMe] = useState<Participant | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("participant");
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return null;
  });
  const save = (p: Participant) => {
    localStorage.setItem("participant", JSON.stringify(p));
    setMe(p);
  };
  const clear = () => {
    localStorage.removeItem("participant");
    setMe(null);
  };
  return { me, save, clear };
}
