import { useState } from 'react';
import {
  TextField, Button, MenuItem, Paper, Typography, Box
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import api from '../api/api';

export default function UploadForm({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [tip, setTip] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !tip) return alert('Izberi PDF in vrsto dokumenta');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('tip', tip);

    try {
      await api.post('/dokumenti/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Dokument uspešno dodan!');
      setFile(null); setTip('');
      onUploadSuccess?.();
    } catch {
      alert('Napaka pri nalaganju.');
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Dodaj dokument (račun ali garancija)
      </Typography>

      <form onSubmit={handleUpload}>
        <TextField
          fullWidth select label="Vrsta" value={tip}
          onChange={(e) => setTip(e.target.value)} margin="normal"
        >
          <MenuItem value="racun">Račun</MenuItem>
          <MenuItem value="garancija">Garancija</MenuItem>
        </TextField>

        {file && (
          <Box display="flex" alignItems="center" gap={1} mt={1} mb={1}>
            <AttachFileIcon color="action" />
            <Typography variant="body2">{file.name}</Typography>
          </Box>
        )}

        <Button variant="contained" component="label" fullWidth sx={{ my: 2 }}>
          Izberi PDF
          <input
            type="file" hidden accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </Button>

        <Button type="submit" variant="contained" fullWidth>
          Naloži
        </Button>
      </form>
    </Paper>
  );
}
