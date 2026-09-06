"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import ThemeToggle from "./theme-toggle";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import styles from "./landing-page.module.css";
import {
  HomeMock,
  NutricionMock,
  EntrenamientoMock,
  MentalMock,
  ProgresoMock,
  PerfilMock,
} from "./screen-mocks";

// --- Tipos ---
interface Screen {
  id: string;
  Mock: React.ComponentType;
  categoryKey: string;
  titleKey: string;
  blurbKey: string;
}

// Pantallas de la galería, en orden. Cada una con su maqueta y claves i18n.
const SCREENS: Screen[] = [
  { id: "home", Mock: HomeMock, categoryKey: "cardHomeCategory", titleKey: "cardHomeTitle", blurbKey: "cardHomeBlurb" },
  { id: "nutricion", Mock: NutricionMock, categoryKey: "cardNutricionCategory", titleKey: "cardNutricionTitle", blurbKey: "cardNutricionBlurb" },
  { id: "entrenamiento", Mock: EntrenamientoMock, categoryKey: "cardEntrenamientoCategory", titleKey: "cardEntrenamientoTitle", blurbKey: "cardEntrenamientoBlurb" },
  { id: "mental", Mock: MentalMock, categoryKey: "cardMentalCategory", titleKey: "cardMentalTitle", blurbKey: "cardMentalBlurb" },
  { id: "progreso", Mock: ProgresoMock, categoryKey: "cardProgresoCategory", titleKey: "cardProgresoTitle", blurbKey: "cardProgresoBlurb" },
  { id: "perfil", Mock: PerfilMock, categoryKey: "cardPerfilCategory", titleKey: "cardPerfilTitle", blurbKey: "cardPerfilBlurb" },
];

export default function LandingPage() {
  const t = useTranslations("landing");
  const galleryRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);
  // Cuando GSAP no anima (reduced-motion o error), la galería usa scroll nativo.
  const [animated, setAnimated] = useState(true);

  useEffect(() => {
    const reduceMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const track = trackRef.current;
    const section = galleryRef.current;

    if (reduceMotion || !track || !section) {
      setAnimated(false);
      return;
    }

    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    let smoother: ScrollSmoother | undefined;

    const ctx = gsap.context(() => {
      smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.2,
        effects: true,
      });

      const getDistance = () => Math.max(0, track.scrollWidth - section.clientWidth);

      // Track horizontal anclado (pin) que avanza con el scroll vertical.
      const tween = gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + (getDistance() + window.innerHeight * 0.6),
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
        },
      });

      // Cada tarjeta entra con escala/opacidad al cruzar el viewport horizontal.
      cardsRef.current.filter(Boolean).forEach((card, i) => {
        gsap.fromTo(
          card,
          { scale: 0.92, opacity: 0.55, y: i % 2 === 0 ? 18 : -18 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: card as Element,
              containerAnimation: tween,
              start: "left 88%",
              end: "left 45%",
              scrub: true,
            },
          }
        );
      });
    });

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
      smoother?.kill();
    };
  }, []);

  return (
    <div className={styles.page}>
      {/* Nav fijo, fuera del contenido suavizado */}
      <nav className={styles.nav}>
        <span className={styles.navBrand}>{t("brand")}</span>
        <div className={styles.navLinks}>
          <Link href="/auth/login" className={styles.navLogin}>
            {t("signIn")}
          </Link>
          <Link href="/auth/sign-up" className={styles.navSignup}>
            {t("signUp")}
          </Link>
        </div>
      </nav>

      <div id="smooth-wrapper">
        <div id="smooth-content" className={styles.smoothContent}>
          {/* Hero */}
          <section className={styles.hero}>
            <div className={styles.heroGlow} aria-hidden="true" />
            <span className={styles.heroBadge}>{t("badge")}</span>
            <h1 className={styles.heroTitle}>
              {t("titleL1")}
              <br />
              {t("titleL2")}
            </h1>
            <p className={styles.heroSubtitle}>{t("subtitle")}</p>
            <div className={styles.heroActions}>
              <Link href="/auth/login" className={styles.finalBtnOutline}>
                {t("signIn")}
              </Link>
              <Link href="/auth/sign-up" className={styles.finalBtnFilled}>
                {t("signUp")}
              </Link>
            </div>
            <div className={styles.scrollCue}>
              <span className={styles.scrollCueLine} />
              <span className={styles.scrollCueText}>{t("scrollCue")}</span>
            </div>
          </section>

          {/* Galería con scroll horizontal */}
          <section
            ref={galleryRef}
            className={`${styles.gallery} ${animated ? "" : styles.galleryStatic}`}
          >
            <div className={styles.galleryHead}>
              <span className={styles.galleryEyebrow}>{t("galleryEyebrow")}</span>
              <h2 className={styles.galleryHeading}>{t("galleryHeading")}</h2>
            </div>
            <div className={styles.trackViewport}>
              <div
                ref={trackRef}
                className={`${styles.track} ${animated ? "" : styles.trackStatic}`}
              >
                {SCREENS.map((screen, i) => {
                  const Mock = screen.Mock;
                  return (
                    <div
                      key={screen.id}
                      ref={(el) => {
                        cardsRef.current[i] = el;
                      }}
                      className={styles.card}
                    >
                      <div className={styles.cardFrame}>
                        <div className={styles.cardScreen}>
                          <Mock />
                        </div>
                      </div>
                      <div className={styles.cardMeta}>
                        <span className={styles.cardCategory}>{t(screen.categoryKey)}</span>
                        <h3 className={styles.cardTitle}>{t(screen.titleKey)}</h3>
                        <p className={styles.cardBlurb}>{t(screen.blurbKey)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* CTA final */}
          <section className={styles.finalCta}>
            <h2 className={styles.finalCtaHeading}>{t("ctaHeading")}</h2>
            <p className={styles.finalCtaSubtitle}>{t("ctaSubtitle")}</p>
            <div className={styles.finalCtaActions}>
              <Link href="/auth/login" className={styles.finalBtnOutline}>
                {t("signIn")}
              </Link>
              <Link href="/auth/sign-up" className={styles.finalBtnFilled}>
                {t("signUp")}
              </Link>
            </div>
          </section>

          <footer className={styles.footer}>
            <span>{t("footer")}</span>
            <span className={styles.footerSwitcher}>
              <ThemeToggle />
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}
