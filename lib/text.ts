/** Minuscules avec majuscule initiale (fr). */
export function sentenceCaseFr(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  const lower = trimmed.toLocaleLowerCase("fr-FR");
  let out = lower.charAt(0).toLocaleUpperCase("fr-FR") + lower.slice(1);

  // Volumes / unités collés : 25cl, 1l, 70cl…
  out = out.replace(
    /(\d(?:[,.]\d*)?)(kg|cl|ml|l)\b/gi,
    (_, n: string, u: string) => n + u.toUpperCase(),
  );

  // Abréviations d’unités isolées
  out = out.replace(
    /(?<![a-zà-ÿ])(kg|cl|ml|pqt|col|ctn|bte|plt|bqt|sac|un|bt|pi|l)(?![a-zà-ÿ])/gi,
    (u) => u.toUpperCase(),
  );

  // Conserver les jetons d’une lettre déjà en majuscule (ex. « Stock A »)
  const origParts = trimmed.split(/(\s+)/);
  const outParts = out.split(/(\s+)/);
  if (origParts.length === outParts.length) {
    for (let i = 0; i < origParts.length; i++) {
      if (/^[A-ZÀ-Ÿ]$/.test(origParts[i])) outParts[i] = origParts[i];
    }
    out = outParts.join("");
  }

  return out;
}
