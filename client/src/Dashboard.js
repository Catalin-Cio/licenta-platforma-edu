import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    } else {
      navigate('/login'); // Dacă nu ești logat, te dă afară
    }
  }, [navigate]);

  if (!user) return <div>Se încarcă...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Salut, {user.nume}! 👋</h1>
      <div style={{ border: '2px solid green', padding: '20px', borderRadius: '10px', display: 'inline-block' }}>
        <h3>Portofelul tău:</h3>
        <h1 style={{ color: 'green', margin: 0 }}>💰 {user.wallet} Credite</h1>
      </div>
      <br /><br />
      <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{background: 'red', color: 'white', border: 'none', padding: '10px'}}>
        Delogare
      </button>
    </div>
  );
}

export default Dashboard;