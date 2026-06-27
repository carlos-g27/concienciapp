"use client";

import { useState } from "react";
import Link from "next/link";
import SidebarLayout from "@/components/dashboard-logic/sidebar-config";
import AccordionWrapper from "@/components/ui/accordion-wrapper";
import styles from "./faq.module.css";

// --- Datos mock ---
const faqs = [
  {
    question: "¿Cómo puedo cambiar mi rutina de ejercicio?",
    answer: "Tu rutina es asignada por tu entrenador. Si deseas un cambio, contáctalo directamente desde la sección de Ayuda.",
  },
  {
    question: "¿Cada cuánto se actualiza mi plan nutricional?",
    answer: "El plan nutricional se actualiza semanalmente según tu progreso. Puedes ver los cambios cada lunes en la sección de Nutrición.",
  },
  {
    question: "¿Puedo registrar ejercicios adicionales fuera de mi rutina?",
    answer: "Por el momento solo puedes registrar el peso usado en los ejercicios de tu rutina asignada. Próximamente habrá más opciones.",
  },
  {
    question: "¿Cómo funciona el control de pesos?",
    answer: "En cada ejercicio puedes registrar el peso que usaste en esa sesión. Esto te permite llevar un historial de tu progreso.",
  },
  {
    question: "¿Mis datos están seguros?",
    answer: "Sí. Toda tu información está almacenada de forma segura y solo tú y tu entrenador tienen acceso a ella.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <SidebarLayout pageTitle="FAQ">
      <div className={styles.page}>

        {/* Header */}
        <div className={styles.pageHeader}>
          <Link href="/settings" className={styles.backBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver
          </Link>
          <h1 className={styles.pageTitle}>Preguntas frecuentes</h1>
          <p className={styles.pageSubtitle}>Encuentra respuestas a las dudas más comunes</p>
        </div>

        {/* Lista de FAQs con AccordionWrapper */}
        <div className={styles.faqList}>
          {faqs.map((faq, i) => (
            <AccordionWrapper
              key={i}
              title={faq.question}
              badgeText=" "
              isOpen={openIndex === i}
              onToggle={() => handleToggle(i)}
            >
              <p className={styles.faqAnswer}>{faq.answer}</p>
            </AccordionWrapper>
          ))}
        </div>

      </div>
    </SidebarLayout>
  );
}