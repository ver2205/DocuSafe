import React from 'react';

export default function Dashboard({ onLogout }) {
  return (
    <div>
      <h2>Dobrodošla v DocuSafe!</h2>
      <button onClick={onLogout}>Odjava</button>
    </div>
  );
}
