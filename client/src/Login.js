import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

function Login() {
  const [formData, setFormData] = useState({ email: '', parola: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // --- LOGICA PENTRU CĂRȚI PE FUNDAL (2026 System) ---
  const [books, setBooks] = useState([]);
  const bookEmojis = ['📚', '📖', '📕', '📗', '📘', '📙', '📓', '🎓'];

  useEffect(() => {
    // Generăm o carte nouă lent, una la 2.5 secunde
    const interval = setInterval(() => {
      const newBook = {
        id: Date.now(),
        emoji: bookEmojis[Math.floor(Math.random() * bookEmojis.length)],
        startX: Math.random() * 90 + 5 + '%', // Poziție X aleatorie
        fallDuration: Math.random() * 3 + 12, // Cad lent, între 12 și 15 secunde
        rotation: Math.random() * 360 - 180, // Se rotesc aleatoriu în timpul căderii
        size: Math.random() * 1 + 1.5 + 'rem', // Dimensiuni ușor diferite
      };
      setBooks((prev) => [...prev, newBook]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Funcție pentru curățarea memoriei după ce animația se termină
  const removeBook = (id) => {
    setBooks((prev) => prev.filter((book) => book.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));
            toast.success("✅ Autentificare reușită!");
            setTimeout(() => window.location.href = '/marketplace', 1000);
        } else {
            toast.error(`❌ ${data.message}`);
            setIsLoading(false);
        }
    } catch (err) {
        console.error(err);
        toast.error("❌ Eroare de conexiune cu serverul!");
        setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      
      {/* --- SISTEMUL DE CĂRȚI ANIMATE PE FUNDAL --- */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }}>
        {books.map((book) => (
          <motion.div
            key={book.id}
            initial={{ y: '-10vh', x: book.startX, rotate: 0, opacity: 0 }}
            animate={{ 
                y: '110vh', 
                rotate: book.rotation, 
                opacity: [0, 0.7, 0.7, 0] // Apar lent, stau vizibile, dispar lent jos
            }}
            transition={{ duration: book.fallDuration, ease: 'linear' }}
            onAnimationComplete={() => removeBook(book.id)} // Ștergem din DOM
            style={{ 
                position: 'absolute', 
                fontSize: book.size, 
                /* Umbra frumoasă solicitată, dă efect 3D */
                textShadow: '0 5px 15px rgba(0,0,0,0.2)', 
                zIndex: -1 
            }}
          >
            {book.emoji}
          </motion.div>
        ))}
      </div>

      {/* CARDUL LIQUID GLASS (Plutește subtil) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: [-5, 5, -5] }} 
        transition={{ 
            opacity: { duration: 0.5 }, 
            scale: { duration: 0.5 },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{ 
            width: '100%', 
            maxWidth: '380px', 
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.05) 100%)', 
            backdropFilter: 'blur(30px) saturate(150%)',
            WebkitBackdropFilter: 'blur(30px) saturate(150%)',
            borderRadius: '30px', 
            padding: '45px 35px', 
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.3), inset 0 0 25px rgba(255, 255, 255, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            textAlign: 'center',
            zIndex: 1
        }}
      >
         {/* Logo sticlos */}
         <div style={{ background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.8), rgba(155, 89, 182, 0.8))', width: '56px', height: '56px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px auto', boxShadow: '0 8px 20px rgba(155, 89, 182, 0.4), inset 0 2px 4px rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.4)' }}>
            <span style={{ fontSize: '28px', color: 'white', fontWeight: '900', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>M</span>
         </div>
         
         <h2 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '1.7rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Bine ai revenit</h2>
         <p style={{ color: '#475569', fontSize: '0.95rem', margin: '0 0 35px 0', fontWeight: '500' }}>Conectează-te la Mentorium.</p>

         <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <input 
                type="email" 
                placeholder="Adresa de email" 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required
                style={{ width: '100%', padding: '15px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)', outline: 'none', fontSize: '15px', background: 'rgba(255,255,255,0.5)', color: '#0f172a', fontWeight: '500', transition: 'all 0.3s ease', boxSizing: 'border-box', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.02)' }}
                onFocus={e => { e.target.style.borderColor = '#9b59b6'; e.target.style.background = 'rgba(255,255,255,0.8)'; e.target.style.boxShadow = '0 0 0 4px rgba(155, 89, 182, 0.2)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.5)'; e.target.style.background = 'rgba(255,255,255,0.5)'; e.target.style.boxShadow = 'inset 0 2px 5px rgba(0,0,0,0.02)'; }}
            />
            
            <input 
                type="password" 
                placeholder="Parola" 
                onChange={e => setFormData({...formData, parola: e.target.value})} 
                required
                style={{ width: '100%', padding: '15px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)', outline: 'none', fontSize: '15px', background: 'rgba(255,255,255,0.5)', color: '#0f172a', fontWeight: '500', transition: 'all 0.3s ease', boxSizing: 'border-box', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.02)' }}
                onFocus={e => { e.target.style.borderColor = '#9b59b6'; e.target.style.background = 'rgba(255,255,255,0.8)'; e.target.style.boxShadow = '0 0 0 4px rgba(155, 89, 182, 0.2)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.5)'; e.target.style.background = 'rgba(255,255,255,0.5)'; e.target.style.boxShadow = 'inset 0 2px 5px rgba(0,0,0,0.02)'; }}
            />
            
            <motion.button 
                whileHover={{ scale: 1.03, boxShadow: '0 10px 25px rgba(15, 23, 42, 0.3)' }} 
                whileTap={{ scale: 0.97 }} 
                type="submit" 
                disabled={isLoading}
                style={{ 
                    marginTop: '10px', 
                    padding: '16px', 
                    background: isLoading ? '#cbd5e1' : '#0f172a',
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '16px', 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    cursor: isLoading ? 'not-allowed' : 'pointer', 
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 15px rgba(15, 23, 42, 0.2)'
                }}
            >
                {isLoading ? 'Se conectează...' : 'Intră în cont'}
            </motion.button>
         </form>
         
         <p style={{ marginTop: '30px', marginBottom: 0, fontSize: '14px', color: '#475569', fontWeight: '500' }}>
            Nu ai cont? <Link to="/register" style={{ color: '#9b59b6', fontWeight: '800', textDecoration: 'none' }}>Creează unul acum</Link>
         </p>
      </motion.div>
    </div>
  );
}

export default Login;