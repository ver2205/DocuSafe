// This update replaces the DataGrid table with card-style document entries and filter buttons for document views.
// It assumes that styling and components are adapted to match your visual design goal.

import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import UploadForm from '../components/UploadForm';
import api from '../api/api';
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  Chip,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { differenceInCalendarDays } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return new Uint8Array([...raw].map((char) => char.charCodeAt(0)));
}

export default function DocumentsTable({ rows, refreshDocs }) {
  const [docs, setDocs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null); // za prikaz dialoga

  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearch] = useState('');     
  const askDelete = (doc) => {
    setDeleteTarget(doc);
  };
  
  const confirmDelete = async () => {
    if (!deleteTarget) return;
  
    try {
      await api.delete(`/dokumenti/${deleteTarget.id}`);
      setDeleteTarget(null);
      refreshDocs();
    } catch (err) {
      console.error('Napaka pri brisanju dokumenta:', err);
    }
  };
  
  
  const fetchDocs = async () => {
    const res = await api.get('/dokumenti');
    const sorted = res.data.sort((a, b) => b.id - a.id);

    setDocs(sorted);
    applyFilter(filter, res.data);
  };
  const byStatus = rows.filter(d => {
    if (filter === 'placano')     return d.placano;
    if (filter === 'neplacano')   return !d.placano;
    if (filter === 'racun')       return d.tip === 'racun';
    if (filter === 'garancija')   return d.tip === 'garancija';
    return true; // all
  });

  const visible = byStatus.filter(d =>
    (d.naslov || '').toLowerCase()
      .includes(searchQuery.toLowerCase())
  );
  const applyFilter = (type, allDocs = docs) => {
    setFilter(type);
    let filteredDocs = allDocs;
    if (type === 'placano') filteredDocs = allDocs.filter((d) => d.placano);
    else if (type === 'neplacano') filteredDocs = allDocs.filter((d) => !d.placano);
    else if (type === 'racun') filteredDocs = allDocs.filter((d) => d.tip === 'racun');
    else if (type === 'garancija') filteredDocs = allDocs.filter((d) => d.tip === 'garancija');
    setFiltered(filteredDocs);
  };

  useEffect(() => {
    //subscribeUser();
    fetchDocs();
  }, []);

 
  
  

  const openPdf = async (id) => {
    const res = await api.get(`/dokumenti/${id}/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    window.open(url);
  };

  const handleTogglePlacano = async (id, placano) => {
    await api.put(`/dokumenti/${id}`, { placano });
    refreshDocs();
  };

  return (
    <>
     <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
      <TextField
          size="small"
          label="Išči dokument"
          value={searchQuery}
          onChange={e => setSearch(e.target.value)}
        />
        <Stack direction="row" spacing={1}>
          {['all', 'placano', 'neplacano', 'racun', 'garancija'].map((t) => (
            <Button
              key={t}
              variant={filter === t ? 'contained' : 'outlined'}
              onClick={() => applyFilter(t)}
            >
              {t === 'all' ? 'Vsi dokumenti' : t.charAt(0).toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </Stack>
      </Box>
  
      {showForm && (
        <UploadForm onUploadSuccess={() => {
          fetchDocs();
          setShowForm(false);
        }} />
      )}
  
      <Stack spacing={2}>
        {visible.map((doc) => {
          const date = new Date(doc.datum);
          const expired = date < new Date() && !doc.placano;
          const today     = new Date();
          const dueDate   = new Date(doc.datum);            // rok dokumenta
          const diffDays  = differenceInCalendarDays(dueDate, today); 
          let label = '', color = 'default';
          if (diffDays > 0)        { label = `${diffDays} dni`; color = 'info';     }
          else if (diffDays === 0) { label = 'Danes';        color = 'warning';  }
          else if (!doc.placano)   { label = `${Math.abs(diffDays)} dni zamude`; color = 'error'; }
          return (
            <Box
              key={doc.id}
              sx={{
                width: '100%',
                p: 2,
                borderRadius: 2,
                border: expired ? '2px solid darkred' : '1px solid #e0e0e0',
                boxShadow: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'left',
              }}
            >
              <Box sx={{ pr: 2, maxWidth: '75%' }}>
                <Typography variant="subtitle1" fontWeight={600}>{doc.naslov}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {isNaN(date) ? '—' : date.toLocaleDateString('sl-SI')}
                </Typography>
              </Box>
  
              <Stack direction="row" spacing={2} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 110 }}>
                  <Select
                    value={doc.placano ? 'placano' : 'neplacano'}
                    onChange={(e) =>
                      handleTogglePlacano(doc.id, e.target.value === 'placano')
                    }
                  >
                    <MenuItem value="placano">Plačano</MenuItem>
                    <MenuItem value="neplacano">Neplačano</MenuItem>
                  </Select>
                </FormControl>
  
                <IconButton onClick={() => openPdf(doc.id)}>
                  <PictureAsPdfIcon />
                </IconButton>
                <IconButton  onClick={() => askDelete(doc)}>
                  <DeleteIcon />
                </IconButton>


                {label && <Chip label={label} color={color} size="small" />}
              </Stack>
            </Box>
          );
        })}
      </Stack>
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
  <DialogTitle>Izbrišem dokument?</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Dokument "{deleteTarget?.naslov ?? ''}" bo trajno izbrisan skupaj z vsemi povezanimi opomniki. Želite nadaljevati?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setDeleteTarget(null)}>Prekliči</Button>
    <Button onClick={confirmDelete} color="error" variant="contained">
      Izbriši
    </Button>
  </DialogActions>
</Dialog>

    </>
  );
  
}
