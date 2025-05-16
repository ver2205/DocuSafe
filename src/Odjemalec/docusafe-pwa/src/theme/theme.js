// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#3F8CFF' }, // modra kot InvoiceOwl
    secondary: { main: '#00B472' }, // zelena kot QuickBooks
    background: { default: '#F6F8FB' },
  },
  typography: {
    fontFamily: ['Inter', 'sans-serif'].join(','),
  },
  components: {
    MuiPaper: { styleOverrides: { root: { borderRadius: 16 } } },
    MuiButton: {
      styleOverrides: { root: { textTransform: 'none', borderRadius: 12 } },
    },
  },
});

export default theme;
