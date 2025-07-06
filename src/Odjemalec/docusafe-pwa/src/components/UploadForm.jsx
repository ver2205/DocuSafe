import { useState, useRef, useEffect } from 'react';
import {
  TextField, Button, MenuItem, Paper, Typography, Box
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import api from '../api/api';
import { Snackbar, Alert } from '@mui/material';

export default function UploadForm({ onUploadSuccess, fileButtonRef, fileButtonRefSubmit }) {
  const [file, setFile] = useState(null);
  const [tip, setTip] = useState('');
  const [notif, setNotif] = useState({ open: false, message: '', severity: 'success' });
  const hiddenInputRef = useRef();
  const submitButtonRef = useRef();
  const showNotif = (message, severity = 'success') => {
    setNotif({ open: true, message, severity });
  };
  
  useEffect(() => {
    if (fileButtonRef ) {
      fileButtonRef.current = {
        trigger: () => hiddenInputRef.current?.click(),
      };
    }
    if (fileButtonRefSubmit ) {
      fileButtonRefSubmit.current = {
        trigger: () => submitButtonRef.current?.click(),
      };
    }
    
  }, [fileButtonRef, fileButtonRefSubmit]);

  

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !tip) {
      showNotif('Izberi PDF in vrsto dokumenta', 'warning');
      return;
    }
    

    const formData = new FormData();
    formData.append('file', file);
    formData.append('tip', tip);

    try {
      await api.post('/dokumenti/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showNotif('Dokument uspešno dodan!', 'success');

     
    setTimeout(() => {
      setFile(null);
      setTip('');
      onUploadSuccess?.();
    },450 ); 
    } catch {
      showNotif('Napaka pri nalaganju.', 'warning');
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
           Izberi dokument (PDF/JPG/PNG)
                <input
                  type="file"
                  hidden
                  ref={hiddenInputRef}
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={(e) => setFile(e.target.files[0])}
                />
        </Button>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          ref={submitButtonRef}
        >
          Naloži
        </Button>
      </form>
      <Snackbar
  open={notif.open}
  autoHideDuration={4000}
  onClose={() => setNotif({ ...notif, open: false })}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
>
  <Alert
    onClose={() => setNotif({ ...notif, open: false })}
    severity={notif.severity}
    variant="filled"
    sx={{ width: '100%' }}
  >
    {notif.message}
  </Alert>
</Snackbar>
    </Paper>
  );
}
