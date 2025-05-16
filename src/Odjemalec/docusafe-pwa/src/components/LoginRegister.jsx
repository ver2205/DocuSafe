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
export default function LoginRegister({ onLogin }) {
  const [tab, setTab] = useState(0); // 0 = prijava, 1 = registracija
  const [form, setForm] = useState({ ime: '', email: '', geslo: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = tab === 0 ? '/uporabniki/prijava' : '/uporabniki';
    console.log('Pošiljam na endpoint:', endpoint, 'z baseURL:', api.defaults.baseURL);

    try {
      const res = await api.post(endpoint, form);
      if (tab === 0) {
        localStorage.setItem('token', res.data.token);
        onLogin();
      } else {
        alert('Registracija uspešna!');
        setTab(0);
      }
    } catch (err) {
      alert(err.response?.data?.msg || 'Napaka pri prijavi/registraciji.');
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
    </Container>
  );
}
