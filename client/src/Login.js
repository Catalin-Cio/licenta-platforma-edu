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
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/marketplace'); 
    } else {
      alert(data.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center' }}>Autentificare</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} />
          <input type="password" placeholder="Parola" onChange={e => setFormData({...formData, parola: e.target.value})} />
          <button type="submit">Intră în cont</button>
        </form>
      </div>
    </div>
  );
}

export default Login;