import { Reveal } from "@/components/public/motion";
import { Eyebrow } from "@/components/public/ui";

export function PageBanner({
  eyebrow,
  title,
  copy,
  image,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  image: string;
}) {
  return (
    <section className="uma-page-banner uma-surface-dark">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" className="uma-page-banner-media" />
      <div className="uma-page-banner-wash" />
      <div className="uma-page-banner-copy">
        <Reveal>
          <Eyebrow className="uma-eyebrow--gold">{eyebrow}</Eyebrow>
          <h1 className="uma-page-banner-title">{title}</h1>
          {copy ? <p className="uma-page-banner-sub">{copy}</p> : null}
        </Reveal>
      </div>
    </section>
  );
}
