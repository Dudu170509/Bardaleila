import { QRCodeSVG } from "qrcode.react";

export function JoinQR({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border-2 border-lime bg-cream p-3 shadow-pop-lime sticker">
      <div className="rounded-lg bg-cream p-1">
        <QRCodeSVG value={url} size={100} bgColor="#fef9e7" fgColor="#1f0a2e" level="M" />
      </div>
      <div className="pr-2">
        <p className="font-hand text-2xl text-cherry leading-none">vem dar lance!</p>
        <p className="mt-1 font-mono text-[9px] font-bold uppercase text-background">
          Aponte a câmera 📸
        </p>
        <p className="mt-1 max-w-[140px] truncate font-mono text-[10px] text-background/70">
          {url.replace(/^https?:\/\//, "")}
        </p>
      </div>
    </div>
  );
}
