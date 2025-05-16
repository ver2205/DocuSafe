import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import StatCards from '../components/StatCards';
import UploadForm from '../components/UploadForm';
import DocumentsTable from '../components/DocumentsTable';
import api from '../api/api';

export default function DashboardPage({ user }) {
  const [docs, setDocs] = useState([]);
  const [counts, setCounts] = useState({ docs: 0, reminders: 0 });
  const [showForm, setShowForm] = useState(false);

  const fetchDocs = async () => {
    const res = await api.get('/dokumenti');
    setDocs(res.data);
    setCounts((c) => ({ ...c, docs: res.data.length }));
  };
  const fetchReminders = async () => {
    const res = await api.get('/opomniki');
    const opomniki = res.data.models ?? res.data;
  
    // šteje samo tiste, kjer je dokument še neplačan
    const aktivni = opomniki.filter((o) => !o.dokument?.placano);
    setCounts((c) => ({ ...c, reminders: aktivni.length }));
  };
  

  useEffect(() => { fetchDocs(); fetchReminders()}, []);

  const openPdf = async (id) => {
    const res = await api.get(`/dokumenti/${id}/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    window.open(url);
  };

  return (
    <Layout onToggleForm={() => setShowForm((prev) => !prev)} showForm={showForm} user={user}>
      <StatCards counts={counts} />

      {showForm && (
        <UploadForm onUploadSuccess={() => {
          fetchDocs();
          fetchReminders();
          setShowForm(false); // skrij formo po uspešnem uploadu
        }} />
      )}

<DocumentsTable rows={docs} openPdf={openPdf} refreshDocs={fetchDocs} />

    </Layout>
  );
}
