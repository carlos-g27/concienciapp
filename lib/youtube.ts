// --- Utilidades para links de YouTube ---

/**
 * Extrae el ID del video (11 caracteres) de un link de YouTube.
 * Soporta youtube.com/watch?v=, youtu.be/, /shorts/, /embed/ y /live/.
 * Devuelve null si el link no es un video de YouTube válido.
 */
export function getYoutubeId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^(www\.|m\.)/, "");
  let id: string | null = null;

  if (host === "youtu.be") {
    id = parsed.pathname.split("/")[1] ?? null;
  } else if (host === "youtube.com") {
    id =
      parsed.pathname === "/watch"
        ? parsed.searchParams.get("v")
        : (parsed.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1] ?? null);
  }

  return id && /^[\w-]{11}$/.test(id) ? id : null;
}

/** Miniatura del video (null si el link no es de YouTube). */
export function getYoutubeThumbnail(url: string | null | undefined): string | null {
  const id = url ? getYoutubeId(url) : null;
  return id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : null;
}
