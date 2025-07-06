import { useEffect, useState } from 'react';
import api from '../api/api';
import {
  Box, Typography, Stack, Divider
} from '@mui/material';

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    api.get('/opomniki').then((res) => {
      setReminders(res.data.models ?? res.data); 
    });
  }, []);
  

  return (
    <Box sx={{ mt:3,mb: 2 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={600} sx={{ mt:3,mb: 2 }}>
        Moji opomniki
        </Typography>
    </Stack>
      <Stack spacing={2}>
        {reminders.map((r) => {
          const datum = new Date(r.dokument.datum).toLocaleDateString('sl-SI');
          const poslano = r.zadnjicPoslano
            ? new Date(r.zadnjicPoslano).toLocaleDateString('sl-SI')
            : 'ni poslano';

          return (
            <Box key={r.id} sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
              <Typography fontWeight={600}>
                📄 {r.dokument?.naslov || '(ni naslova)'}
              </Typography>
              <Typography variant="body2">🗓️ Rok: {datum}</Typography>
              <Typography variant="body2">📤 Zadnjič poslano: {poslano}</Typography>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
