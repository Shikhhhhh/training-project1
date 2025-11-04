// Centralized Theme Configuration - MetaMask Inspired
export const theme = {
  colors: {
    primary: {
      DEFAULT: '#7C3AED',
      light: '#A855F7',
      dark: '#6D28D9',
      50: '#F5F3FF',
      100: '#EDE9FE',
      200: '#DDD6FE',
      300: '#C4B5FD',
      400: '#A78BFA',
      500: '#8B5CF6',
      600: '#7C3AED',
      700: '#6D28D9',
      800: '#5B21B6',
      900: '#4C1D95',
    },
    secondary: {
      DEFAULT: '#14B8A6',
      light: '#2DD4BF',
      dark: '#0D9488',
    },
    tertiary: {
      DEFAULT: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    accent: {
      DEFAULT: '#06B6D4',
      light: '#22D3EE',
      dark: '#0891B2',
    },
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    
    // Grays
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    
    // Dark Mode
    dark: {
      bg: '#0F172A',
      surface: '#1E293B',
      card: '#334155',
      text: '#F1F5F9',
      muted: '#94A3B8',
    },
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px',
  },
  
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  
  transitions: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    page: '400ms',
  },
  
  typography: {
    fontFamily: {
      body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      heading: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #7C3AED 0%, #14B8A6 100%)',
    secondary: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)',
    hero: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #14B8A6 100%)',
    dark: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
    card: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)',
  },
};

export default theme;

