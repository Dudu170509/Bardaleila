export const AVATARS = ["🦊", "🐼", "🐸", "🦄", "🐙", "🐵", "🦁", "🐯", "🐧", "🦉", "🐢", "🐝", "🍕", "🍔", "🍻", "🎸", "🎲", "🚀", "👽", "🤖", "👻", "🧙", "🥷", "🦸"];

export const formatBRL = (cents: number) =>
  cents.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });

export type Auction = {
  id: string;
  name: string;
  status: "DRAFT" | "ACTIVE" | "FINISHED";
  current_item_id: string | null;
};

export type Item = {
  id: string;
  auction_id: string;
  order: number;
  title: string;
  description: string;
  emoji: string;
  image_url: string | null;
  starting_price: number;
  min_increment: number;
  status: "PENDING" | "ACTIVE" | "CLOSED";
  winner_bid_id: string | null;
};

export type Bid = {
  id: string;
  item_id: string;
  participant_id: string;
  amount: number;
  created_at: string;
};

export type Participant = {
  id: string;
  name: string;
  avatar: string;
};
