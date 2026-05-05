import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1A73E8',
      light: '#4285F4',
      dark: '#1557B0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#7B1FA2',
      light: '#9C47D3',
      dark: '#4A0072',
      contrastText: '#fff',
    },
    info: {
      main: '#17C1E8',
    },
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#FB8C00',
    },
    error: {
      main: '#F44335',
    },
    dark: {
      main: '#344767',
      light: '#527192',
      dark: '#1D293A',
    },
    background: {
      default: '#f0f2f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#7B809A',
      secondary: '#344767',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.25,
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.375,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.375,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.375,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.625,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.625,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.625,
    },
    button: {
      fontWeight: 700,
      lineHeight: 1.625,
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.25,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 700,
      lineHeight: 1.25,
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 0.75,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(0,0,0,0.08)',
    '0 4px 8px rgba(0,0,0,0.1)',
    '0 6px 12px rgba(0,0,0,0.12)',
    '0 8px 16px rgba(0,0,0,0.14)',
    '0 10px 20px rgba(0,0,0,0.16)',
    '0 12px 24px rgba(0,0,0,0.18)',
    '0 14px 28px rgba(0,0,0,0.2)',
    '0 16px 32px rgba(0,0,0,0.22)',
    '0 18px 36px rgba(0,0,0,0.24)',
    '0 20px 40px rgba(0,0,0,0.26)',
    '0 22px 44px rgba(0,0,0,0.28)',
    '0 24px 48px rgba(0,0,0,0.3)',
    '0 26px 52px rgba(0,0,0,0.32)',
    '0 28px 56px rgba(0,0,0,0.34)',
    '0 30px 60px rgba(0,0,0,0.36)',
    '0 32px 64px rgba(0,0,0,0.38)',
    '0 34px 68px rgba(0,0,0,0.4)',
    '0 36px 72px rgba(0,0,0,0.42)',
    '0 38px 76px rgba(0,0,0,0.44)',
    '0 40px 80px rgba(0,0,0,0.46)',
    '0 42px 84px rgba(0,0,0,0.48)',
    '0 44px 88px rgba(0,0,0,0.5)',
    '0 46px 92px rgba(0,0,0,0.52)',
    '0 48px 96px rgba(0,0,0,0.54)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f0f2f5',
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#1A73E8 transparent',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          padding: '0.625rem 1.5rem',
          fontSize: '0.75rem',
          letterSpacing: '0.025rem',
        },
        contained: {
          boxShadow: '0 4px 7px -1px rgba(0,0,0,0.11), 0 2px 4px -1px rgba(0,0,0,0.07)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
        },
      },
    },
  },
});

export default theme;
