"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const t = useTranslations("common");
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";

    const input = (
      <input
        type={isPassword && showPassword ? "text" : type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          // Espacio para el ojo y sin el ojo nativo de Edge (saldrían dos).
          isPassword && "pr-9 [&::-ms-reveal]:hidden",
          className,
        )}
        ref={ref}
        {...props}
      />
    );

    if (!isPassword) return input;

    // Contraseña: botón de ojo para mostrar u ocultar lo escrito.
    return (
      <div className="relative w-full">
        {input}
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? t("hidePassword") : t("showPassword")}
          aria-pressed={showPassword}
          disabled={props.disabled}
          className="absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        </button>
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
