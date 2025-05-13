import { useState } from 'react';
import LoginRegister from './components/LoginRegister';
import Dashboard from './components/Dashboard';

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));

  return (
    <>
      {loggedIn ? (
        <Dashboard onLogout={() => {
          localStorage.removeItem('token');
          setLoggedIn(false);
        }} />
      ) : (
        <LoginRegister onLogin={() => setLoggedIn(true)} />
      )}
    </>
  );
}

export default App;
