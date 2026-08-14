import Link from "next/link";
import { HoverZoom } from "@/components/public/motion";

export type GalleryFrame = {
  id: string;
  src: string;
  title: string;
  meta?: string;
  href?: string;
};

export function CineMosaic({ frames }: { frames: GalleryFrame[] }) {
  return (
    <div className="uma-mosaic">
      {frames.map((frame, i) => {
        const inner = (
          <>
            <HoverZoom className="uma-mosaic-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={frame.src} alt={frame.title} loading="lazy" decoding="async" />
            </HoverZoom>
            <div className="uma-mosaic-cap">
              <p className="uma-reel-num">{String(i + 1).padStart(2, "0")}</p>
              <h3>{frame.title}</h3>
              {frame.meta ? <p>{frame.meta}</p> : null}
            </div>
          </>
        );
        if (frame.href) {
          return (
            <Link key={frame.id} href={frame.href} className="uma-mosaic-frame">
              {inner}
            </Link>
          );
        }
        return (
          <div key={frame.id} className="uma-mosaic-frame">
            {inner}
          </div>
        );
      })}
    </div>
  );
}
