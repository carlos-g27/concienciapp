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
export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  age: string;
  weight: string;
  goal: string;
  avatar_url: string;
}

interface ProfileContextValue {
  profile: UserProfile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  updateAvatar: (url: string) => void;
}

// --- Helpers ---
function getInitials(name: string): string {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export { getInitials };

// --- Context ---
const ProfileContext = createContext<ProfileContextValue | null>(null);

// --- Provider ---
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setProfile(null);
        return;
      }

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("name, email, phone, age, weight, goal, avatar_url")
        .eq("id", user.id)
        .single();

      if (profileError || !data) return;

      setProfile({
        name:       data.name       ?? "",
        email:      data.email      ?? user.email ?? "",
        phone:      data.phone      ?? "",
        age:        data.age        ? String(data.age)    : "",
        weight:     data.weight     ? String(data.weight) : "",
        goal:       data.goal       ?? "",
        avatar_url: data.avatar_url ?? "",
      });
    } catch (err) {
      console.error("Error cargando perfil:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Cargar perfil al montar
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Actualizar avatar localmente sin refetch completo
  const updateAvatar = useCallback((url: string) => {
    setProfile((prev) => (prev ? { ...prev, avatar_url: url } : prev));
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        refreshProfile: fetchProfile,
        updateAvatar,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

// --- Hook público ---
export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile debe usarse dentro de <ProfileProvider>");
  }
  return ctx;
}