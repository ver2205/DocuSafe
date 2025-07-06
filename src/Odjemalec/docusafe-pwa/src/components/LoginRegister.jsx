import React, { useState } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Tabs,
  Tab,
  Typography,
  Paper,
} from '@mui/material';
import api from './../api/api'
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';

export default function LoginRegister({ onLogin }) {
  const [tab, setTab] = useState(0); // 0 = prijava, 1 = registracija
  const [form, setForm] = useState({ ime: '', email: '', geslo: '' });
  const [notif, setNotif] = useState({ open: false, message: '', severity: 'success' });

  const navigate = useNavigate();
  const showNotif = (message, severity = 'success') => {
    setNotif({ open: true, message, severity });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = tab === 0 ? '/uporabniki/prijava' : '/uporabniki';
    console.log('Pošiljam na endpoint:', endpoint, 'z baseURL:', api.defaults.baseURL);

    try {
      const res = await api.post(endpoint, form);
      if (tab === 0) {
        localStorage.setItem('token', res.data.token);
        onLogin();
        navigate('/docs');
      } else {
        
        showNotif('Registracija uspešna!', 'success');

        setTab(0);
      }
    } catch (err) {
      showNotif('Napaka pri prijavi/registraciji.', 'warning');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Tabs value={tab} onChange={(e, val) => setTab(val)} centered>
          <Tab label="Prijava" />
          <Tab label="Registracija" />
        </Tabs>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }} noValidate>
          {tab === 1 && (
            <TextField
              fullWidth
              label="Ime"
              margin="normal"
              onChange={(e) => setForm({ ...form, ime: e.target.value })}
            />
          )}
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            fullWidth
            label="Geslo"
            type="password"
            margin="normal"
            onChange={(e) => setForm({ ...form, geslo: e.target.value })}
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
            {tab === 0 ? 'Prijavi se' : 'Registriraj se'}
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={notif.open}
        autoHideDuration={4000}
        onClose={() => setNotif({ ...notif, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setNotif({ ...notif, open: false })} severity={notif.severity} sx={{ width: '100%' }}>
          {notif.message}
        </Alert>
      </Snackbar>

    </Container>
  );
}
