/**
 * Contrast checker utility for WCAG AA compliance
 * WCAG AA requires:
 * - 4.5:1 for normal text (under 18pt or 14pt bold)
 * - 3:1 for large text (18pt+ or 14pt+ bold)
 */

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG AA standards
 */
export function meetsWCAGAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Get contrast ratio with pass/fail status
 */
export function checkContrast(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): {
  ratio: number;
  passes: boolean;
  level: 'AA' | 'AAA' | 'FAIL';
} {
  const ratio = getContrastRatio(foreground, background);
  const aaThreshold = isLargeText ? 3 : 4.5;
  const aaaThreshold = isLargeText ? 4.5 : 7;

  if (ratio >= aaaThreshold) {
    return { ratio, passes: true, level: 'AAA' };
  } else if (ratio >= aaThreshold) {
    return { ratio, passes: true, level: 'AA' };
  } else {
    return { ratio, passes: false, level: 'FAIL' };
  }
}

/**
 * Common color combinations to verify
 */
export const colorCombinations = {
  // Text on backgrounds
  textOnBg: { fg: '#F8FAFC', bg: '#0A1E1E' }, // --text on --bg
  textMutedOnBg: { fg: '#94A3B8', bg: '#0A1E1E' }, // --text-muted on --bg
  textSubtleOnBg: { fg: '#64748B', bg: '#0A1E1E' }, // --text-subtle on --bg
  
  // Buttons
  whiteOnHolidayRed: { fg: '#FFFFFF', bg: '#EB6A46' }, // Button text on holiday red
  darkOnBrand: { fg: '#0B1120', bg: '#FFB217' }, // Dark text on brand yellow
  
  // Status chips
  warningOnBg: { fg: '#F59E0B', bg: '#0A1E1E' },
  successOnBg: { fg: '#10B981', bg: '#0A1E1E' },
  errorOnBg: { fg: '#EF4444', bg: '#0A1E1E' },
};











