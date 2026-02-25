import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ email: '', parola: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (response.ok) {
      // Salvăm userul în memoria browserului (localStorage)
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard'); 
    } else {
      alert(data.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Autentificare</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} style={{display:'block', margin:'10px 0', padding:'5px'}} />
        <input type="password" placeholder="Parola" onChange={e => setFormData({...formData, parola: e.target.value})} style={{display:'block', margin:'10px 0', padding:'5px'}} />
        <button type="submit">Intră în cont</button>
      </form>
    </div>
  );
}

export default Login;