import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import LoginRegister from './components/LoginRegister';
import DashboardPage from './components/DashboardPage';
import RemindersPage from './components/RemindersPage';
import ReminderSettings from './components/ReminderSettings';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
const theme = createTheme({
  palette: {
    primary: {
      main: '#24382a',
      contrastText: '#fff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#24382a',
          '&:hover': {
            backgroundColor: '#3e4e1f',
          },
        },
        outlinedPrimary: {
          borderColor: '#24382a',
          color: '#24382a',
          '&:hover': {
            backgroundColor: '#eef1e0',
          },
        },
      },
    },
  },
});

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));
  const token = localStorage.getItem('token');
  let user = null;

  if (token) {
    try {
      user = jwtDecode(token);
    } catch (err) {
      console.error('Neveljaven token', err);
      localStorage.removeItem('token');
      setLoggedIn(false);
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <BrowserRouter>
      {!loggedIn ? (
        <LoginRegister onLogin={() => setLoggedIn(true)} />
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/docs" />} />
          <Route path="/docs" element={<DashboardPage user={user} />} />
          <Route
            path="/reminders"
            element={
              <Layout user={user}>
                <RemindersPage user={user} />
              </Layout>
            }
          />

        <Route path="/settings" element={
          <Layout user={user}>
            <ReminderSettings user={user} />
          </Layout>
        } />
          <Route path="*" element={<div> Stran ne obstaja.</div>} />

        </Routes>
      )}
    </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
