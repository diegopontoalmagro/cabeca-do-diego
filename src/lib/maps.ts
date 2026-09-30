/**
 * Valida e normaliza links do Google Maps.
 * Aceita: google.com/maps..., maps.google.com/..., maps.app.goo.gl/..., goo.gl/maps...
 * (o banco repete essa regra em um CHECK, então nada inválido entra mesmo fora do app)
 */
export function normalizeMapsUrl(input: string): string {
  const v = input.trim();
  if (!v) return "";
  if (/^http:\/\//i.test(v)) return v.replace(/^http:/i, "https:");
  return /^https:\/\//i.test(v) ? v : `https://${v}`;
}

export function isGoogleMapsUrl(input: string): boolean {
  try {
    const u = new URL(normalizeMapsUrl(input));
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    const path = u.pathname;
    if (host === "maps.app.goo.gl") return path.length > 1;
    if (host === "goo.gl") return path.startsWith("/maps");
    // Domínios do Google: google.com, google.com.br, google.co.uk, google.de ...
    // (o TLD é restrito para recusar impostores como google.com.evil.com)
    const G = "google\\.(com(\\.[a-z]{2})?|co\\.[a-z]{2}|[a-z]{2})";
    if (new RegExp(`^maps\\.${G}$`).test(host)) return true;
    if (new RegExp(`^(www\\.)?${G}$`).test(host)) return path.startsWith("/maps");
    return false;
  } catch {
    return false;
  }
}
