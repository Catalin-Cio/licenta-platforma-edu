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
import CommandPalette from './CommandPalette'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Home from './Home';
import Footer from './Footer';
import NotFound from './NotFound';
import WelcomeModal from './WelcomeModal';

function App() {
  const [user, setUser] = useState(null);
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 

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
      } catch (err) { console.error("Eroare:", err); }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsMobileMenuOpen(false);
    window.location.href = '/'; 
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  const unreadCount = notifs.filter(n => !n.citit).length;

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {user && <CommandPalette />}
        {user && <WelcomeModal user={user} />}

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} style={{ zIndex: 999999 }} />

        <div 
          className={`drawer-overlay ${isMobileMenuOpen ? 'open' : ''}`} 
          onClick={closeMenu}
        ></div>

        <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
           <button onClick={closeMenu} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'white', fontSize: '30px', cursor: 'pointer' }}>✕</button>
           
           <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', marginBottom: '10px' }}>
              <Link to="/" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.6rem', fontWeight: '900', color: 'white', textDecoration: 'none' }}>
                  <div style={{ background: 'linear-gradient(135deg, #3498db, #9b59b6)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <span style={{ fontSize: '20px', color: 'white' }}>M</span>
                  </div>
                  Mentorium
              </Link>
           </div>

           <Link to="/marketplace" onClick={closeMenu} className="nav-link">Marketplace</Link>
           <Link to="/leaderboard" onClick={closeMenu} className="nav-link nav-link-top">Top Studenți</Link>

           {user ? (
              <>
                <Link to="/upload" onClick={closeMenu} className="nav-link">Upload Material</Link>
                <Link to="/sessions" onClick={closeMenu} className="nav-link">Meditații</Link>
                <Link to="/profile" onClick={closeMenu} className="nav-link">Profilul Meu</Link>
                <Link to="/learn" onClick={closeMenu} className="nav-link" style={{ color: '#d2b4de', fontWeight: 'bold' }}>AI Tutor</Link>
                {user.role === 'admin' && <Link to="/admin" onClick={closeMenu} className="nav-link" style={{ color: '#ff4757', fontWeight: 'bold' }}>Admin Panel</Link>}
                
                <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button onClick={() => { closeMenu(); window.dispatchEvent(new CustomEvent('openCommandPalette')); }} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', width: '100%', padding: '12px', borderRadius: '10px', border: 'none', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        🔍 Căutare (Ctrl+K)
                    </button>
                    <button onClick={handleLogout} style={{ background: 'rgba(231, 76, 60, 0.2)', color: '#ff7675', width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(231, 76, 60, 0.5)', fontWeight: 'bold' }}>Logout</button>
                </div>
              </>
           ) : (
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to="/login" onClick={closeMenu} className="nav-link" style={{ textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>Login</Link>
                <Link to="/register" onClick={closeMenu} style={{ background: 'linear-gradient(135deg, #27ae60, #2ecc71)', color: 'white', padding: '12px', borderRadius: '8px', textAlign: 'center', textDecoration: 'none', fontWeight: 'bold' }}>Register</Link>
              </div>
           )}
        </div>

        <nav style={{ 
          padding: '10px 30px',
          position: 'fixed', top: 0, left: 0, width: '100%', boxSizing: 'border-box', zIndex: 999, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.4s ease-in-out',
          background: isScrolled ? 'transparent' : 'rgba(15, 23, 42, 0.85)', 
          backdropFilter: isScrolled ? 'blur(2px)' : 'blur(20px)',
          WebkitBackdropFilter: isScrolled ? 'blur(2px)' : 'blur(20px)',
          borderBottom: isScrolled ? '1px solid transparent' : '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem', fontWeight: '900', color: 'white', textDecoration: 'none', textShadow: isScrolled ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
              <div style={{ background: 'linear-gradient(135deg, #3498db, #9b59b6)', borderRadius: '10px', width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                  <span style={{ fontSize: '18px', color: 'white' }}>M</span>
              </div>
              Mentorium
            </Link>
          </div>

          <div className="desktop-only" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
            <Link to="/marketplace" className="nav-link" style={{ fontSize: '14px', textShadow: isScrolled ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none', whiteSpace: 'nowrap' }}>Marketplace</Link>
            <Link to="/leaderboard" className="nav-link nav-link-top" style={{ fontSize: '14px', textShadow: isScrolled ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none', whiteSpace: 'nowrap' }}>Top</Link>

            {user && (
              <>
                <Link to="/upload" className="nav-link" style={{ fontSize: '14px', textShadow: isScrolled ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none', whiteSpace: 'nowrap' }}>Upload</Link>
                <Link to="/sessions" className="nav-link" style={{ fontSize: '14px', textShadow: isScrolled ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none', whiteSpace: 'nowrap' }}>Meditații</Link>
                <Link to="/profile" className="nav-link" style={{ fontSize: '14px', textShadow: isScrolled ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none', whiteSpace: 'nowrap' }}>Profil</Link>
                <Link to="/learn" className="nav-link" style={{ fontSize: '14px', textShadow: isScrolled ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none', color: '#d2b4de', fontWeight: 'bold', whiteSpace: 'nowrap' }}>AI Tutor</Link>
                {user.role === 'admin' && <Link to="/admin" className="nav-link" style={{ fontSize: '14px', color: '#ff4757', fontWeight: 'bold', textShadow: isScrolled ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none', whiteSpace: 'nowrap' }}>Admin</Link>}
              </>
            )}
          </div>

          <div className="desktop-only" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px' }}>
            {user ? (
              <>
                <div onClick={() => window.dispatchEvent(new CustomEvent('openCommandPalette'))} style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '6px 12px', borderRadius: '20px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: isScrolled ? '0 4px 10px rgba(0,0,0,0.3)' : 'none' }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'; }} onMouseOut={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'; }} title="Deschide meniul rapid">
                   <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> Caută...</span>
                   <span style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '3px 6px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>Ctrl K</span>
                </div>

                <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => setShowNotifs(!showNotifs)}>
                   <span style={{ fontSize: '18px', textShadow: isScrolled ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none' }}>🔔</span>
                   {unreadCount > 0 && <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: '#e74c3c', color: 'white', borderRadius: '50%', padding: '2px 5px', fontSize: '10px', fontWeight: 'bold', border: '1px solid rgba(44, 62, 80, 0.8)' }}>{unreadCount}</span>}
                   {showNotifs && (
                       <div className="notif-dropdown" onClick={(e) => e.stopPropagation()} style={{ top: '35px', right: '-10px' }}>
                           <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '10px', color: '#333' }}>Notificări</h4>
                           {notifs.length === 0 ? <p style={{ fontSize: '13px', color: '#777' }}>Nu ai notificări.</p> : null}
                           {notifs.map(n => <div key={n.id} className={`notif-item ${n.citit ? '' : 'unread'}`} onClick={() => markAsRead(n.id)}>{n.mesaj}</div>)}
                       </div>
                   )}
                </div>
                <button onClick={handleLogout} style={{ background: 'transparent', color: '#ff7675', border: '1px solid rgba(255, 118, 117, 0.5)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', whiteSpace: 'nowrap' }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link" style={{ fontSize: '14px', textShadow: isScrolled ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none', whiteSpace: 'nowrap' }}>Login</Link>
                <Link to="/register" style={{ background: 'linear-gradient(135deg, #27ae60, #2ecc71)', color: 'white', padding: '6px 16px', borderRadius: '8px', fontSize: '14px', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(39, 174, 96, 0.3)', whiteSpace: 'nowrap' }}>Register</Link>
              </>
            )}
          </div>

          <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {user && (
                <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => setShowNotifs(!showNotifs)}>
                   <span style={{ fontSize: '18px', textShadow: isScrolled ? '0px 2px 4px rgba(0,0,0,0.5)' : 'none' }}>🔔</span>
                   {unreadCount > 0 && <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: '#e74c3c', color: 'white', borderRadius: '50%', padding: '2px 5px', fontSize: '10px', fontWeight: 'bold' }}>{unreadCount}</span>}
                   {showNotifs && (
                       <div className="notif-dropdown" onClick={(e) => e.stopPropagation()} style={{ top: '35px', right: '-10px', width: '250px' }}>
                           <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '10px', color: '#333' }}>Notificări</h4>
                           {notifs.length === 0 ? <p style={{ fontSize: '13px', color: '#777' }}>Nu ai notificări.</p> : null}
                           {notifs.map(n => <div key={n.id} className={`notif-item ${n.citit ? '' : 'unread'}`} onClick={() => markAsRead(n.id)}>{n.mesaj}</div>)}
                       </div>
                   )}
                </div>
              )}
              <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
                  ☰
              </button>
          </div>
        </nav>

        <div style={{ flex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '20px', paddingTop: '80px', boxSizing: 'border-box' }}>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>

        <Footer />
        
      </div>
    </BrowserRouter>
  );
}

export default App;