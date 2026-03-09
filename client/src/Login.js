import { useState } from 'react';

function Login() {
  const [formData, setFormData] = useState({ email: '', parola: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/marketplace'; 
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
        alert("Eroare de conexiune!");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center' }}>Autentificare</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Email" 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            required
          />
          <input 
            type="password" 
            placeholder="Parola" 
            onChange={e => setFormData({...formData, parola: e.target.value})} 
            required
          />
          <button type="submit">Intră în cont</button>
        </form>
      </div>
    </div>
  );
}

export default Login;