import { 
  DM_Sans, 
  Plus_Jakarta_Sans, 
  Manrope 
} from 'next/font/google';

/**
 * ARTI OPTİK TİPOGRAFİ SİSTEMİ v1.0
 * Strateji: Tech Luxury / Native App Feel
 * 
 * Final Typography Decision:
 * - Display: DM Sans (Headings, Hero Text)
 * - Body: Plus Jakarta Sans (Paragraphs, UI Text)
 * - Numbers: Manrope (Pricing, Numerical Data)
 */

// === DISPLAY FONT (Headings & Hero) ===
export const fontDisplay = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

// === BODY FONT (Paragraphs & UI) ===
export const fontBody = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
});

// === NUMBERS FONT (Pricing & Data) ===
export const fontNumbers = Manrope({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-numbers',
  display: 'swap',
});