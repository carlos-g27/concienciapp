"use client";

import { useState } from "react";
import Link from "next/link";
import AccordionWrapper from "@/components/ui/accordion-wrapper";
import styles from "./faq.module.css";

// --- Datos mock ---
const helpItems = [
  {
    title: "Contactar soporte",
    content: (
      <>
        <p className={styles.faqAnswer}>
          ¿Tienes un problema técnico o una duda que no encontraste en el FAQ? Escríbenos directamente.
        </p>
        <a href="mailto:soporte@empresa.com" className={styles.helpCardLink}>
          soporte@empresa.com
        </a>
      </>
    ),
  },
  {
    title: "Habla con tu entrenador",
    content: (
      <p className={styles.faqAnswer}>
        Para dudas sobre tu rutina, plan nutricional o progreso, comunícate directamente con tu entrenador asignado.
      </p>
    ),
  },
  {
    title: "Preguntas frecuentes",
    content: (
      <>
        <p className={styles.faqAnswer}>
          Consulta nuestra sección de FAQ para encontrar respuestas rápidas a las dudas más comunes.
        </p>
        <Link href="/settings/faq" className={styles.helpCardLink}>
          Ver FAQ →
        </Link>
      </>
    ),
  },
];

export default function Help() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className={styles.page}>

        {/* Header */}
        <div className={styles.pageHeader}>
          <Link href="/settings" className={styles.backBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver
          </Link>
          <h1 className={styles.pageTitle}>Centro de ayuda</h1>
          <p className={styles.pageSubtitle}>¿Necesitas asistencia? Estamos aquí para ayudarte</p>
        </div>

        {/* Lista de ayuda con AccordionWrapper */}
        <div className={styles.faqList}>
          {helpItems.map((item, i) => (
            <AccordionWrapper
              key={i}
              title={item.title}
              badgeText=""
              isOpen={openIndex === i}
              onToggle={() => handleToggle(i)}
            >
              {item.content}
            </AccordionWrapper>
          ))}
        </div>

    </div>
  );
}