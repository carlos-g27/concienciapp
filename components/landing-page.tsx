import Link from "next/link";
import styles from "./landing-page.module.css";

// --- Iconos de los pilares ---
const IconFisico = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1" />
    <path d="M9 20l3-14 3 14" />
    <path d="M7 10h10" />
  </svg>
);

const IconNutricion = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
);

const IconMental = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
  </svg>
);

const IconTrainer = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconProgress = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const IconDevice = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

const PILLARS = [
  {
    icon: <IconFisico />,
    title: "Pilar Físico",
    description: "Rutinas de ejercicio personalizadas, día a día, con videos, series y repeticiones diseñadas para ti.",
  },
  {
    icon: <IconNutricion />,
    title: "Pilar Nutrición",
    description: "Planes de comida para desayuno, almuerzo y cena, con ingredientes, cantidades y calorías detalladas.",
  },
  {
    icon: <IconMental />,
    title: "Pilar Mental",
    description: "Meditaciones guiadas para acompañarte en tu bienestar emocional, siempre a un clic de distancia.",
  },
];

const STEPS = [
  {
    icon: <IconTrainer />,
    title: "Tu entrenador arma tu plan",
    description: "Un administrador diseña tu rutina, tu nutrición y tus meditaciones a la medida de tus objetivos.",
  },
  {
    icon: <IconDevice />,
    title: "Accede desde cualquier lugar",
    description: "Consulta tu plan cuando quieras, desde el celular o la computadora, sin complicaciones.",
  },
  {
    icon: <IconProgress />,
    title: "Registra tu progreso",
    description: "Guarda los pesos que usas en cada ejercicio y observa tu evolución con el tiempo.",
  },
];

export default function LandingPage() {
  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <span className={styles.heroBadge}>Bienestar integral</span>
        <h1 className={styles.heroTitle}>
          Tu cuerpo, tu nutrición y tu mente,<br className={styles.heroBreak} /> en un solo lugar
        </h1>
        <p className={styles.heroSubtitle}>
          Concienciapp acompaña tu bienestar con rutinas de ejercicio, planes de nutrición
          y meditaciones guiadas, diseñados especialmente para ti por tu entrenador.
        </p>
        <div className={styles.heroActions}>
          <Link href="/auth/sign-up" className={styles.ctaPrimary}>
            Crear cuenta gratis
          </Link>
          <Link href="/auth/login" className={styles.ctaSecondary}>
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      {/* ── Los 3 pilares ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>Qué encontrarás</span>
          <h2 className={styles.sectionTitle}>Tres pilares, un solo bienestar</h2>
          <p className={styles.sectionSubtitle}>
            Cada aspecto de tu salud, cuidado de forma consciente y personalizada.
          </p>
        </div>

        <div className={styles.pillarsGrid}>
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className={styles.pillarCard}>
              <div className={styles.pillarIconWrapper}>{pillar.icon}</div>
              <h3 className={styles.pillarTitle}>{pillar.title}</h3>
              <p className={styles.pillarDescription}>{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>Cómo funciona</span>
          <h2 className={styles.sectionTitle}>Simple, personal y siempre contigo</h2>
        </div>

        <div className={styles.stepsGrid}>
          {STEPS.map((step, i) => (
            <div key={step.title} className={styles.stepCard}>
              <div className={styles.stepNumber}>{i + 1}</div>
              <div className={styles.stepIconWrapper}>{step.icon}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className={styles.finalCta}>
        <h2 className={styles.finalCtaTitle}>Empieza tu camino hoy</h2>
        <p className={styles.finalCtaSubtitle}>
          Únete a Concienciapp y deja que tu bienestar sea cuidado en cada detalle.
        </p>
        <Link href="/auth/sign-up" className={styles.finalCtaButton}>
          Crear cuenta gratis
        </Link>
      </section>

    </div>
  );
}