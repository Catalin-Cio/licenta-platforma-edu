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
      if (response.ok) {
        setMessage('✅ Cont creat! Te redirecționăm...');
        setTimeout(() => navigate('/login'), 2000); // Îl trimite la login după 2 secunde
      } else {
        setMessage('❌ Eroare la înregistrare.');
      }
    } catch (error) {
      setMessage('Eroare conexiune.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Înregistrare Student</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="nume" placeholder="Nume" onChange={handleChange} style={{display:'block', margin:'10px 0', padding:'5px'}} />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} style={{display:'block', margin:'10px 0', padding:'5px'}} />
        <input type="password" name="parola" placeholder="Parola" onChange={handleChange} style={{display:'block', margin:'10px 0', padding:'5px'}} />
        <button type="submit">Creează Cont</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default Register;