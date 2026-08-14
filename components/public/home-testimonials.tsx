import { Reveal } from "@/components/public/motion";
import { Eyebrow } from "@/components/public/ui";

export type HomeTestimonial = {
  id: string;
  name: string;
  quote: string;
  rating?: number | null;
  event?: string | null;
};

export function HomeTestimonials({ items }: { items: HomeTestimonial[] }) {
  return (
    <section className="uma-chapter uma-chapter--cream">
      <div className="uma-chapter-inner">
        <Reveal className="uma-chapter-head uma-chapter-head--center">
          <Eyebrow>Voices</Eyebrow>
          <h2 className="uma-section-title">In their words</h2>
        </Reveal>
        {items.length ? (
          <div className="uma-testimonial-grid">
            {items.map((item) => (
              <blockquote key={item.id} className="uma-testimonial">
                {item.rating ? (
                  <p className="uma-testimonial-rating" aria-label={`${item.rating} of 5`}>
                    {"★".repeat(Math.min(5, Math.max(0, Math.round(item.rating))))}
                  </p>
                ) : null}
                <p className="uma-testimonial-quote">{item.quote}</p>
                <footer>
                  <cite>{item.name}</cite>
                  {item.event ? <span>{item.event}</span> : null}
                </footer>
              </blockquote>
            ))}
          </div>
        ) : (
          <p className="uma-empty uma-empty--center">
            Host reflections will appear here when they are shared with the studio.
          </p>
        )}
      </div>
    </section>
  );
}
