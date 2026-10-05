export const colors = {
  background: '#EAEAEA',
  surface: '#FFFFFF',
  cardSoft: '#F4F4F4',
  cardBorder: 'rgba(135,135,135,0.31)',
  text: '#4D4D4D',
  textMuted: '#878787',
  textLabel: '#6E6E6E',
  headerText: '#33401F',
  chipText: '#1E1E1E',

  primary: '#4B6B17',       // buttons, links
  primaryDark: '#3F5A13',
  primaryMid: '#5A801A',
  primaryLight: '#71A122',
  green: '#5A801A',         // active icons, sensor values
  greenLight: '#71A122',    // status dots
  tint: 'rgba(113,161,34,0.2)', // soft green backgrounds
  tagline: '#476515'
} as const;

// Device header gradient (Figma uses a radial gradient: light green in the middle)
export const deviceGradient = ['#71A122', '#5A801A', '#3F5A13'] as const;

export const suitabilityStyle = {
  // text + bg = pill badges (Records). plain = text only (Home).
  Suitable: { text: '#1DBA5D', bg: '#BEF7D6', plain: '#51B279' },
  Marginal: { text: '#E2A73A', bg: '#FFECC9', plain: '#E2A73A' },
  Unsuitable: { text: '#EB2427', bg: '#FFE0E1', plain: '#B25153' },
} as const;

export const fonts = {
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
  hindLight: 'HindVadodara_300Light',
  hindRegular: 'HindVadodara_400Regular',
  hindMedium: 'HindVadodara_500Medium',
  hindSemiBold: 'HindVadodara_600SemiBold',
  hindBold: 'HindVadodara_700Bold',
  // TODO(Phase 8): the splash tagline uses Funnel Sans Light in Figma. Hind Light stands in for now.
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radius = { card: 15, md: 16, lg: 24, xl: 25, pill: 20 } as const;