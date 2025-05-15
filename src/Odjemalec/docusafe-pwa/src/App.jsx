import { useState } from 'react';
import LoginRegister from './components/LoginRegister';
import Dashboard from './components/DashboardPage';
import { jwtDecode } from 'jwt-decode';

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));
  const token = localStorage.getItem('token');
  let user = null;
  if (token) {
    try {
      user = jwtDecode(token); // { id, email, ... }
    } catch (err) {
      console.error('Neveljaven token', err);
      localStorage.removeItem('token');
    }
  }
  return (
    <>
      {loggedIn ? (
        <Dashboard user={user}
         />
      ) : (
        <LoginRegister onLogin={() => setLoggedIn(true)} />
      )}
    </>
  );
}

export default App;
