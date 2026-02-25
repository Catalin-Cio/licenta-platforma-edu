import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'Arial' }}>
        {/* Meniul de navigare */}
        <nav style={{ padding: '15px', background: '#333', color: 'white' }}>
          <Link to="/register" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>Înregistrare</Link>
          <Link to="/login" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>Login</Link>
          <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
        </nav>

        {/* Aici se schimbă paginile */}
        <Routes>
          <Route path="/" element={<Login />} /> {/* Pagina de start e Login */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;