// --- Helper: detecta el tipo de video y arma la URL de embed ---
export function getVideoEmbedInfo(url: string): { type: "youtube" | "vimeo" | "file"; src: string } {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch) {
    return { type: "youtube", src: `https://www.youtube.com/embed/${youtubeMatch[1]}` };
  }

  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return { type: "vimeo", src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  // Cualquier otra URL se trata como archivo de video directo
  return { type: "file", src: url };
}
