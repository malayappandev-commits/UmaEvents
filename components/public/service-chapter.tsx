"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { identityBySlug, type ServiceIdentity } from "@/lib/public/service-visuals";

const CHAPTER_MS = 1600;
const ease = [0.22, 1, 0.36, 1] as const;

const ServiceChapterContext = createContext<(slug: string) => void>(() => {});

export function useEnterService() {
  return useContext(ServiceChapterContext);
}

export function ServiceChapterProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [chapter, setChapter] = useState<ServiceIdentity | null>(null);

  useEffect(() => {
    for (const href of [
      "/visual/services/wedding.webp",
      "/visual/services/birthday.webp",
      "/visual/services/corporate.webp",
      "/visual/services/kitty-party.webp",
      "/visual/services/sangeet.webp",
      "/visual/services/mehndi.webp",
      "/visual/services/housewarming.webp",
      "/visual/services/baby-shower.webp",
    ]) {
      const img = new Image();
      img.src = href;
    }
  }, []);

  const enter = useCallback(
    (slug: string) => {
      const identity = identityBySlug(slug);
      const href = `/services/${identity?.slug || slug}`;
      if (!identity || reduce) {
        router.push(href);
        return;
      }
      setChapter(identity);
      window.setTimeout(() => {
        router.push(href);
        window.setTimeout(() => setChapter(null), 380);
      }, CHAPTER_MS);
    },
    [reduce, router],
  );

  const value = useMemo(() => enter, [enter]);

  return (
    <ServiceChapterContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {chapter ? (
          <motion.div
            className="uma-chapter-gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            role="status"
            aria-label={`Entering ${chapter.title}`}
          >
            <div className="uma-intro-glow" aria-hidden />
            <div className="noise-overlay" />
            <motion.div
              className="uma-chapter-walker"
              initial={{ x: "-42vw" }}
              animate={{ x: "18vw" }}
              transition={{ duration: 1.45, ease }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={chapter.illustration} alt="" />
            </motion.div>
            <p className="uma-eyebrow uma-eyebrow--gold">{chapter.title}</p>
            <div className="uma-intro-progress uma-intro-progress--narrow" aria-hidden>
              <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.4, ease }} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </ServiceChapterContext.Provider>
  );
}

export function ServiceEnterLink({
  slug,
  className,
  children,
}: {
  slug: string;
  className?: string;
  children: ReactNode;
}) {
  const enter = useEnterService();
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    enter(slug);
  };
  return (
    <a href={`/services/${slug}`} className={className} onClick={onClick}>
      {children}
    </a>
  );
}
