import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import Upload from './Upload';
import Marketplace from './Marketplace';
import Profile from './Profile';
import AdminPanel from './AdminPanel';
import Sessions from './Sessions';
import Leaderboard from './Leaderboard';
import Learn from './Learn'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Home from './Home';

function App() {
  const [user, setUser] = useState(null);
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) setIsScrolled(true);
      else setIsScrolled(false);
    };
    window.addEventListener('scroll', handleScroll);

    const u = JSON.parse(localStorage.getItem('user'));
    if (u) {
        setUser(u);
        fetchNotifs(u.id);
        const interval = setInterval(() => fetchNotifs(u.id), 10000);
        const greetingTimer = setTimeout(() => setShowGreeting(false), 60000);
        
        return () => {
            clearInterval(interval);
            clearTimeout(greetingTimer);
            window.removeEventListener('scroll', handleScroll);
        };
    }
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchNotifs = (userId) => {
      fetch(`http://localhost:5000/api/notifications/${userId}`)
        .then(res => res.json())
        .then(data => setNotifs(data))
        .catch(err => console.error(err));
  };

  const markAsRead = async (notifId) => {
      setNotifs(prevNotifs => 
          prevNotifs.map(n => n.id === notifId ? { ...n, citit: true } : n)
      );

      try {
          await fetch(`http://localhost:5000/api/notifications/${notifId}/read`, { method: 'PUT' });
      } catch (err) {
          console.error("Eroare la marcarea ca citit:", err);
      }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login'; 
  };

  const unreadCount = notifs.filter(n => !n.citit).length;

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} style={{ zIndex: 99999 }} />

      <nav style={{ 
        padding: '5px 30px',
        position: 'fixed', top: 0, left: 0, width: '100%', boxSizing: 'border-box', zIndex: 9999, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.4s ease-in-out',
        background: isScrolled ? 'transparent' : 'rgba(44, 62, 80, 0.9)', 
        backdropFilter: isScrolled ? 'blur(2px)' : 'blur(15px)',
        WebkitBackdropFilter: isScrolled ? 'blur(2px)' : 'blur(15px)',
        borderBottom: isScrolled ? '1px solid transparent' : '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ flex: 1 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.4rem', fontWeight: '900', color: 'white', textDecoration: 'none', textShadow: isScrolled ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
    <div style={{ background: 'linear-gradient(135deg, #3498db, #9b59b6)', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
        <span style={{ fontSize: '16px', color: 'white' }}>M</span>
    </div>
    Mentorium
</Link>
        </div>
        
        <div style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
          <Link to="/marketplace" className="nav-link" style={{ fontSize: '14px', textShadow: isScrolled ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none', whiteSpace: 'nowrap' }}>Marketplace</Link>
          <Link to="/leaderboard" className="nav-link nav-link-top" style={{ fontSize: '14px', textShadow: isScrolled ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none', whiteSpace: 'nowrap' }}>Top</Link>

          {user && (
            <>
              <Link to="/upload" className="nav-link" style={{ fontSize: '14px', textShadow: isScrolled ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none', whiteSpace: 'nowrap' }}>Upload</Link>
              <Link to="/sessions" className="nav-link" style={{ fontSize: '14px', textShadow: isScrolled ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none', whiteSpace: 'nowrap' }}>Meditații</Link>
              <Link to="/profile" className="nav-link" style={{ fontSize: '14px', textShadow: isScrolled ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none', whiteSpace: 'nowrap' }}>Profil</Link>
              <Link to="/learn" className="nav-link" style={{ fontSize: '14px', textShadow: isScrolled ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none', color: '#d2b4de', fontWeight: 'bold', whiteSpace: 'nowrap' }}>AI Tutor</Link>

              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link" style={{ fontSize: '14px', color: '#ff4757', fontWeight: 'bold', textShadow: isScrolled ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none', whiteSpace: 'nowrap' }}>Admin</Link>
              )}
            </>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px' }}>
          {user ? (
            <>
              <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => setShowNotifs(!showNotifs)}>
                 <span style={{ fontSize: '18px', textShadow: isScrolled ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none' }}>🔔</span>
                 {unreadCount > 0 && (
                     <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: '#e74c3c', color: 'white', borderRadius: '50%', padding: '2px 5px', fontSize: '10px', fontWeight: 'bold', border: '1px solid rgba(44, 62, 80, 0.8)' }}>
                         {unreadCount}
                     </span>
                 )}
                 {showNotifs && (
                     <div className="notif-dropdown" onClick={(e) => e.stopPropagation()} style={{ top: '30px' }}>
                         <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '10px', color: '#333' }}>Notificări</h4>
                         {notifs.length === 0 ? <p style={{ fontSize: '13px', color: '#777' }}>Nu ai notificări.</p> : null}
                         {notifs.map(n => (
                             <div key={n.id} className={`notif-item ${n.citit ? '' : 'unread'}`} onClick={() => markAsRead(n.id)}>{n.mesaj}</div>
                         ))}
                     </div>
                 )}
              </div>
              {showGreeting && (
                  <span style={{ color: '#bdc3c7', fontSize: '13px', animation: 'fadeIn 0.5s', textShadow: isScrolled ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none', whiteSpace: 'nowrap' }}>Salut, {user.nume}</span>
              )}
              <button onClick={handleLogout} style={{ background: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', whiteSpace: 'nowrap', boxShadow: isScrolled ? '0px 2px 6px rgba(0,0,0,0.3)' : 'none' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" style={{ fontSize: '14px', textShadow: isScrolled ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none', whiteSpace: 'nowrap' }}>Login</Link>
              <Link to="/register" style={{ background: '#27ae60', color: 'white', padding: '4px 12px', borderRadius: '6px', fontSize: '14px', textDecoration: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', boxShadow: isScrolled ? '0px 2px 6px rgba(0,0,0,0.3)' : 'none' }}>Register</Link>
            </>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', paddingTop: '80px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/learn" element={<Learn />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;