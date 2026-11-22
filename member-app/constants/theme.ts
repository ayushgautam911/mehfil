// Design Tokens — Terminal Reductionism / Neo-Teletech
import { Platform } from 'react-native';

export const colors = {
  bg: '#000000',          // Pure black ground — always
  surface: '#0d0d0d',     // raised panel / input well
  surfaceChrome: '#0a0a0a', // floating chrome (tab bar) / sidebar fill
  border: '#1a1a1a',      // hairline dividers & chip outlines
  borderGlow: 'rgba(0,255,65,0.30)', // accent hairline / glow border
  green: '#00ff41',       // primary signal: active / match / approved / CTA
  greenBg: 'rgba(0,255,65,0.06)',
  cyan: '#0abdc6',        // secondary signal: pending / invited / labels
  cyanBg: 'rgba(10,189,198,0.06)',
  text: '#e8e8e8',        // primary readout — never #fff
  textSecondary: '#606060', // secondary / declined / blocked
  textDim: '#333333',     // faint metadata / used / past
  onAccent: '#000000',    // text on a solid green button
};

// Glow is done with shadow* / textShadow* props in RN.
export const glow = {
  green: {
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 4,
  },
  textGreen: {
    textShadowColor: colors.green,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
};

export const fontFamily = {
  regular: 'SpaceGrotesk_400Regular',
  medium: 'SpaceGrotesk_500Medium',
  bold: 'SpaceGrotesk_700Bold',
  // Mono is reserved for true machine readouts (pass codes, hashes).
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string,
};

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 26,
  xxxl: 36,
  hero: 48,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 36,
  xxxl: 56,
};

export const letterSpacing = {
  tight: 0.5,
  normal: 1,
  wide: 2,
  extraWide: 4,
  ultraWide: 8,
};

// status → color rule (passes, members, applications, events). No red anywhere.
export function statusColor(status: string): string {
  switch (status) {
    case 'approved':
    case 'member':
    case 'active':
    case 'published':
    case 'synced':
      return colors.green;
    case 'pending':
    case 'invited':
    case 'applied':
    case 'draft':
      return colors.cyan;
    case 'declined':
    case 'blocked':
      return colors.textSecondary;
    case 'used':
    case 'past':
      return colors.textDim;
    default:
      return colors.textSecondary;
  }
}
