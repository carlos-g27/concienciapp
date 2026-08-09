"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";

// --- Tipos ---
export interface PilarSettings {
  fisico: boolean;
  nutricion: boolean;
  mental: boolean;
}

interface PilarSettingsContextValue {
  pilares: PilarSettings;
  isLoading: boolean;
  refreshPilares: () => Promise<void>;
}

const defaultPilares: PilarSettings = { fisico: true, nutricion: true, mental: true };

// --- Context ---
const PilarSettingsContext = createContext<PilarSettingsContextValue | null>(null);

// --- Provider ---
export function PilarSettingsProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [pilares, setPilares] = useState<PilarSettings>(defaultPilares);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPilares = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("pilar_settings")
        .select("pilar_key, enabled");

      if (error) throw error;

      const next: PilarSettings = { ...defaultPilares };
      data?.forEach((row) => {
        if (row.pilar_key === "fisico") next.fisico = row.enabled;
        if (row.pilar_key === "nutricion") next.nutricion = row.enabled;
        if (row.pilar_key === "mental") next.mental = row.enabled;
      });

      setPilares(next);
    } catch (err) {
      console.error("Error cargando disponibilidad de pilares:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchPilares();
  }, [fetchPilares]);

  return (
    <PilarSettingsContext.Provider value={{ pilares, isLoading, refreshPilares: fetchPilares }}>
      {children}
    </PilarSettingsContext.Provider>
  );
}

// --- Hook público ---
export function usePilarSettings(): PilarSettingsContextValue {
  const ctx = useContext(PilarSettingsContext);
  if (!ctx) {
    throw new Error("usePilarSettings debe usarse dentro de <PilarSettingsProvider>");
  }
  return ctx;
}