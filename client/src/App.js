import { useState } from 'react';
import './App.css';

function App() {
  // Starea formularului (aici ținem ce scrie utilizatorul)
  const [formData, setFormData] = useState({
    nume: '',
    email: '',
    parola: ''
  });
  const [message, setMessage] = useState('');

  // Funcție care se ocupă de scrierea în căsuțe
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Funcție care trimite datele la Server când dai click
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('✅ Student înregistrat cu succes! Ai primit 50 credite.');
      } else {
        setMessage('❌ Eroare la înregistrare.');
      }
    } catch (error) {
      console.error("Eroare:", error);
      setMessage('Eroare de conexiune cu serverul.');
    }
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'Arial' }}>
      <h1>Platforma Educațională (Demo Licență)</h1>
      <h2>Înregistrare Student Nou</h2>
      
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <div style={{ marginBottom: '10px' }}>
          <input 
            type="text" 
            name="nume" 
            placeholder="Numele tău" 
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input 
            type="email" 
            name="email" 
            placeholder="Email instituțional" 
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input 
            type="password" 
            name="parola" 
            placeholder="Parola" 
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px', background: 'blue', color: 'white', border: 'none' }}>
          Creează Cont (Primești 50 Puncte)
        </button>
      </form>

      {message && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}

export default App;