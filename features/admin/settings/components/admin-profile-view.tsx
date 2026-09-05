"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/hooks/use-profile";
import { uploadAvatar } from "@/features/profile/actions";
import { updateAdminProfile } from "../actions";
import type { AdminOwnProfile } from "../types";
import styles from "./admin-profile.module.css";

interface AdminProfileViewProps {
  initialProfile: AdminOwnProfile;
}

export default function AdminProfileView({ initialProfile }: AdminProfileViewProps) {
  const t = useTranslations("adminProfile");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialProfile.avatar_url);
  const [name, setName] = useState(initialProfile.name);
  const [email, setEmail] = useState(initialProfile.email);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [emailPendingMsg, setEmailPendingMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Subir foto de perfil (Server Action reutilizada) ---
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(t("errImageOnly"));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError(t("errImageSize"));
      return;
    }

    setIsUploadingAvatar(true);
    setError(null);

    const formData = new FormData();
    formData.append("avatar", file);
    const res = await uploadAvatar(formData);

    if (res.success && res.avatarUrl) {
      setAvatarUrl(`${res.avatarUrl}?t=${Date.now()}`);
    } else {
      setError(res.error ?? t("errUpload"));
    }
    setIsUploadingAvatar(false);
    e.target.value = "";
  };

  // --- Guardar nombre y correo ---
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);
    setEmailPendingMsg(null);

    const res = await updateAdminProfile({ name, email });

    if (res.success) {
      if (res.emailPending) {
        setEmailPendingMsg(t("emailPending", { email: email.trim() }));
      }
      setSuccessMsg(t("savedOk"));
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setError(res.error ?? t("errSaveChanges"));
    }

    setIsSaving(false);
  };

  return (
    <div className={styles.page}>

      {/* Botón volver */}
      <Link href="/admin/settings" className={styles.backBtn}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {t("backToSettings")}
      </Link>

      <div>
        <h1 className={styles.pageTitle}>{t("title")}</h1>
        <p className={styles.pageSubtitle}>{t("subtitle")}</p>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col gap-6">

          {/* Avatar */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={name || "Avatar"}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className={styles.avatarInitials}>{getInitials(name || "?")}</span>
                )}
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className={styles.cameraBtn}
                aria-label={t("avatarAria")}
              >
                {isUploadingAvatar ? (
                  <svg className={styles.spinner} width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          {/* Nombre */}
          <div className={styles.field}>
            <Label htmlFor="name">{t("nameLabel")}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t("namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Correo */}
          <div className={styles.field}>
            <Label htmlFor="email">{t("emailLabel")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <span className={styles.fieldHint}>
              {t("emailHint")}
            </span>
          </div>

          {/* Feedback */}
          {emailPendingMsg && <p className={styles.pendingMsg}>{emailPendingMsg}</p>}
          {successMsg && <p className={styles.successMsg}>{successMsg}</p>}
          {error && <p className={styles.errorMsg}>{error}</p>}

          <Button onClick={handleSave} disabled={isSaving} className={styles.saveBtn}>
            {isSaving ? t("saving") : t("save")}
          </Button>

        </CardContent>
      </Card>

    </div>
  );
}
