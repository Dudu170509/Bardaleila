import pocketwatch from "@/assets/item-pocketwatch.jpg";
import champagne from "@/assets/item-champagne.jpg";
import painting from "@/assets/item-painting.jpg";

export type AuctionItem = {
  id: string;
  order: number;
  title: string;
  description: string;
  imageUrl: string;
  startingPrice: number;
  minIncrement: number;
  status: "PENDING" | "ACTIVE" | "CLOSED";
};

export type Bid = {
  id: string;
  itemId: string;
  participantName: string;
  amount: number;
  createdAt: number;
};

export const MOCK_ITEMS: AuctionItem[] = [
  {
    id: "i1",
    order: 1,
    title: "Relógio de Bolso — 1898",
    description: "Peça suíça em ouro 18k, mecanismo manual restaurado.",
    imageUrl: pocketwatch,
    startingPrice: 2500,
    minIncrement: 100,
    status: "ACTIVE",
  },
  {
    id: "i2",
    order: 2,
    title: "Champagne Reserva 2003",
    description: "Garrafa numerada, cellar privado de Reims.",
    imageUrl: champagne,
    startingPrice: 1800,
    minIncrement: 50,
    status: "PENDING",
  },
  {
    id: "i3",
    order: 3,
    title: "Retrato a Óleo — Atelier Vauclair",
    description: "Óleo sobre tela, moldura original em folha de ouro.",
    imageUrl: painting,
    startingPrice: 4200,
    minIncrement: 200,
    status: "PENDING",
  },
];

export const MOCK_NAMES = [
  "Helena V.",
  "Ricardo M.",
  "Camila A.",
  "Eduardo P.",
  "Beatriz S.",
  "Gustavo L.",
];

export const formatBRL = (cents: number) =>
  cents.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
