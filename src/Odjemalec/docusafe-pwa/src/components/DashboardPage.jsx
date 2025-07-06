import { useEffect, useState, useRef } from 'react';
import Layout from '../components/Layout';
import UploadForm from '../components/UploadForm';
import DocumentsTable from '../components/DocumentsTable';
import { Box, Button, Stack } from '@mui/material';
import api from '../api/api';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4) % 4));
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return new Uint8Array([...raw].map((char) => char.charCodeAt(0)));
}

export default function DashboardPage({ user }) {
  const [docs, setDocs] = useState([]);
  const [counts, setCounts] = useState({ docs: 0, reminders: 0 });
  const [showForm, setShowForm] = useState(false);
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const fileButtonRef = useRef(); 
  const fileButtonRefSubmit = useRef(); 

  const fetchDocs = async () => {
    const res = await api.get('/dokumenti');
    setDocs(res.data);
    setCounts((c) => ({ ...c, docs: res.data.length }));
  };

  const fetchReminders = async () => {
    const res = await api.get('/opomniki');
    const opomniki = res.data.models ?? res.data;
    const aktivni = opomniki.filter((o) => !o.dokument?.placano);
    setCounts((c) => ({ ...c, reminders: aktivni.length }));
  };

  const startVoiceCommand = () => {
    if (!SpeechRecognition) {
      alert('Ta brskalnik ne podpira govornega vnosa.');
      return;
    }
  
    const recognition = new SpeechRecognition();
    recognition.lang = 'sl-SI';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  
    recognition.start();
  
    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log('Ukaz prepoznan:', command);
  
      if (command.includes('dodaj')) {
        setShowForm(true); 
      } else if (command.includes('zapri')) {
        setShowForm(false);
      } else if (command.includes('izberi')) {
        fileButtonRef.current?.trigger();
      }
      else if (command.includes('naloži')) {
        fileButtonRefSubmit.current?.trigger();
      }
      else {
        alert(`Neprepoznan ukaz: ${command}`);
      }
    };
  
    recognition.onerror = (event) => {
      console.error('Napaka pri govornem prepoznavanju:', event.error);
      alert('Napaka pri prepoznavanju govora.');
    };
  };

  

  useEffect(() => {
    subscribeUser();
    fetchDocs();
    fetchReminders();
  }, []);

  const subscribeUser = async () => {
    console.log('[PUSH] Začetek subscribeUser');
  
    if (!('serviceWorker' in navigator)) return;
    if (!process.env.REACT_APP_VAPID_PUBLIC_KEY) return;
    if (!localStorage.getItem('token')) return;
  
    try {
      const registration = await navigator.serviceWorker.ready;
      console.log('[PUSH]  Service Worker ready');
  
      const existingSub = await registration.pushManager.getSubscription();
  
      if (existingSub) {
        console.log('[PUSH]  Odstranjujem obstoječo naročnino');
        await existingSub.unsubscribe();
      }
  
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY),
      });
  
      console.log('[PUSH] Nova naročnina:', subscription.endpoint);
  
      await api.post('/push/subscribe', {
        endpoint: subscription.endpoint,
        keys: subscription.toJSON().keys,
      });
  
      console.log('[PUSH]  Naročnina poslana backendu');
    } catch (err) {
      console.error('[PUSH] Napaka:', err);
    }
  };
  
  

  
  

  const openPdf = async (id) => {
    const res = await api.get(`/dokumenti/${id}/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    window.open(url);
  };

  return (
    <Layout user={user}>
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <h2>Dokumenti</h2>
          <Button
            variant="contained"
            onClick={() => setShowForm((prev) => !prev)}
            sx={{ borderRadius: 5 }}
          >
            {showForm ? 'Zapri' : '+ Dodaj'}
          </Button>
          <Button
  variant="outlined"
  onClick={() => startVoiceCommand()}
  sx={{ ml: 2 }}
>
  🎤 Glasovni ukaz
</Button>

        </Stack>
      </Box>

      {showForm && (
        <UploadForm
          onUploadSuccess={() => {
            fetchDocs();
            fetchReminders();
            setShowForm(false);
          }}
          fileButtonRef={fileButtonRef}
          fileButtonRefSubmit={fileButtonRefSubmit}

        />
      )}

      <DocumentsTable rows={docs} openPdf={openPdf} refreshDocs={fetchDocs} />
    </Layout>
  );
}
