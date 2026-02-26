import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react'; // <--- Importă astea
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import Upload from './Upload';
import Marketplace from './Marketplace';
import Profile from './Profile';
import AdminPanel from './AdminPanel'; // <--- Import nou
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  // Verificăm la fiecare încărcare dacă avem user logat
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    if (u) setUser(u);
  }, []);

  return (
    <BrowserRouter>
      <nav>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>
          EduPlatform
        </div>
        <div>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/upload">Upload</Link>
          <Link to="/profile">Profil</Link>
          
          {/* Afișăm butonul de Admin doar dacă are rolul potrivit */}
          {user && user.role === 'admin' && (
            <Link to="/admin" style={{ color: '#ff4757', fontWeight: 'bold' }}>ADMIN</Link>
          )}

          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminPanel />} /> {/* Ruta nouă */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;