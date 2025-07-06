import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  Chip,
} from '@mui/material';
import api from '../api/api';
import { Snackbar, Alert } from '@mui/material';

export default function SettingsPage({ user }) {
  const [dniPredRokom, setDniPredRokom] = useState(5);
  const [posljiEmail, setPosljiEmail] = useState(true);
  const [stats, setStats] = useState({ placano: 0, neplacano: 0 });
  const [notif, setNotif] = useState({ open: false, message: '', severity: 'success' });
  const showNotif = (message, severity = 'success') => {
    setNotif({ open: true, message, severity });
  };
  
  useEffect(() => {
    const fetchSettings = async () => {
      const res = await api.get('/nastavitve');
      if (res.data) {
        setDniPredRokom(res.data.dni_pred_rok);
        setPosljiEmail(res.data.posiljaj_email);
      }
    };

    const fetchStats = async () => {
      const res = await api.get('/dokumenti');
      const placano = res.data.filter((d) => d.placano).length;
      const neplacano = res.data.length - placano;
      setStats({ placano, neplacano });
    };

    fetchSettings();
    fetchStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/nastavitve', { dni_pred_rok: dniPredRokom,
        posiljaj_email: posljiEmail, });
        showNotif('Nastavitve shranjene uspešno.', 'success');

  };

  return (
    <Box sx={{ mt:3,mb: 2 }}>    
    <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Typography variant="h5" fontWeight={600} sx={{ mt:3,mb: 2 }}>
         {user?.ime }
      </Typography>
    </Stack>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Chip label={`Plačani: ${stats.placano}`} color="success" />
        <Chip label={`Neplačani: ${stats.neplacano}`} color="warning" />
      </Stack>

      <Typography variant="h6" gutterBottom>
        Nastavitve opomnikov
      </Typography>

      <form onSubmit={handleSubmit}>
      <TextField
            label="Koliko dni pred rokom"
            type="number"
            fullWidth
            value={dniPredRokom}
            onChange={(e) =>
                setDniPredRokom(Math.min(20, Math.max(0, Number(e.target.value))))
            }
            inputProps={{ min: 0, max: 20 }}
            sx={{ mb: 2 }}
            />
        <FormControlLabel
          control={

            <Checkbox
              checked={posljiEmail}
              onChange={(e) => setPosljiEmail(e.target.checked)}
            />
          }
          label="Pošlji opomnike tudi po e-mailu"
        />
        <Box mt={2}>
          <Button type="submit" variant="contained">
            Shrani
          </Button>
        </Box>
      </form>
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

    </Box>
  );
}
