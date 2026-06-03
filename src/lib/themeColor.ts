// src/lib/themeColor.ts

export const cssVarToHex = (
  varName: string,
  el: HTMLElement = document.documentElement
): string => {
  const raw = getComputedStyle(el).getPropertyValue(varName).trim();

  if (!raw) throw new Error(`CSS variable "${varName}" not found`);

  // Rekursiv var() auflösen
  const resolved = raw.startsWith('var(')
    ? cssVarToHex(raw.slice(4, -1).trim(), el)
    : raw;

  // Canvas konvertiert oklch → sRGB nativ (Browser macht das)
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not available');

  ctx.fillStyle = resolved;
  ctx.fillRect(0, 0, 1, 1);

  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  if (a === 0) throw new Error(`Color "${resolved}" is transparent or invalid`);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};