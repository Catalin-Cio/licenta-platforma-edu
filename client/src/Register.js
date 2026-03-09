import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({ nume: '', email: '', parola: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      // AICI CITIM EXACT RĂSPUNSUL SERVERULUI
      const data = await response.json(); 

      if (response.ok) {
        setMessage('✅ Cont creat cu succes! Te redirecționăm...');
        setTimeout(() => navigate('/login'), 2000); 
      } else {
        // AFIȘĂM MOTIVUL EXACT (ex: "Emailul este deja folosit!")
        setMessage(`❌ ${data.message || 'Eroare la înregistrare.'}`);
      }
    } catch (error) {
      setMessage('❌ Eroare de conexiune. Verifică dacă serverul este pornit!');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <div className="card" style={{ padding: '30px', borderRadius: '15px', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '25px' }}>Creare Cont Mentorium</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" name="nume" placeholder="Nume Complet" onChange={handleChange} required 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bdc3c7', outline: 'none', fontSize: '15px' }} 
          />
          <input 
            type="email" name="email" placeholder="Adresă de Email" onChange={handleChange} required 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bdc3c7', outline: 'none', fontSize: '15px' }} 
          />
          <input 
            type="password" name="parola" placeholder="Parolă" onChange={handleChange} required 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bdc3c7', outline: 'none', fontSize: '15px' }} 
          />
          
          <button type="submit" style={{ 
            padding: '12px', 
            background: '#27ae60', // Verdele pe care îl ai pe butonul de Register din meniu
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            fontWeight: 'bold', 
            cursor: 'pointer', 
            fontSize: '16px',
            marginTop: '10px',
            transition: 'transform 0.1s'
          }}>
            Creează Contul
          </button>
        </form>

        {message && (
            <p style={{ textAlign: 'center', marginTop: '20px', fontWeight: 'bold', color: message.includes('✅') ? '#27ae60' : '#e74c3c' }}>
                {message}
            </p>
        )}
      </div>
    </div>
  );
}

export default Register;