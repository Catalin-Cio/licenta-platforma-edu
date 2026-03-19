import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

function Register() {
  const [formData, setFormData] = useState({ nume: '', email: '', parola: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // --- LOGICA PENTRU CĂRȚI PE FUNDAL (Sistem Smart) ---
  const [books, setBooks] = useState([]);
  const bookEmojis = ['📚', '📖', '📕', '📗', '📘', '📙', '📓', '🎓', '✏️', '🖋️'];

  useEffect(() => {
    // Generăm lent, una la 2.5 secunde, ca să fie minimalist
    const interval = setInterval(() => {
      const newBook = {
        id: Date.now(),
        emoji: bookEmojis[Math.floor(Math.random() * bookEmojis.length)],
        startX: Math.random() * 90 + 5 + '%', 
        fallDuration: Math.random() * 3 + 12, // Cad lent, între 12 și 15 secunde
        rotation: Math.random() * 360 - 180, 
        size: Math.random() * 1 + 1.5 + 'rem', 
      };
      setBooks((prev) => [...prev, newBook]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const removeBook = (id) => {
    setBooks((prev) => prev.filter((book) => book.id !== id));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json(); 
      if (response.ok) {
        toast.success('✅ Cont creat cu succes! Te redirecționăm...');
        setTimeout(() => navigate('/login'), 2000); 
      } else {
        toast.error(`❌ ${data.message || 'Eroare la înregistrare.'}`);
        setIsLoading(false);
      }
    } catch (error) {
      toast.error('❌ Eroare de conexiune. Verifică dacă serverul este pornit!');
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
                opacity: [0, 0.6, 0.6, 0] // Putin mai transparente pt tematica verde
            }}
            transition={{ duration: book.fallDuration, ease: 'linear' }}
            onAnimationComplete={() => removeBook(book.id)}
            style={{ 
                position: 'absolute', 
                fontSize: book.size, 
                textShadow: '0 5px 15px rgba(0,0,0,0.15)', // Umbra frumoasă solicitată
                zIndex: -1 
            }}
          >
            {book.emoji}
          </motion.div>
        ))}
      </div>

      {/* CARDUL LIQUID GLASS */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1, y: [-5, 5, -5] }} 
        transition={{ 
            opacity: { duration: 0.5 }, 
            scale: { duration: 0.5 },
            y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 } 
        }}
        style={{ 
            width: '100%', 
            maxWidth: '380px', 
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.1) 100%)', 
            backdropFilter: 'blur(30px) saturate(150%)',
            WebkitBackdropFilter: 'blur(30px) saturate(150%)',
            borderRadius: '30px', 
            padding: '45px 35px', 
            boxShadow: '0 8px 32px 0 rgba(39, 174, 96, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.4), inset 0 0 25px rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            textAlign: 'center',
            zIndex: 1
        }}
      >
         <div style={{ background: 'linear-gradient(135deg, rgba(39, 174, 96, 0.8), rgba(46, 204, 113, 0.8))', width: '56px', height: '56px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px auto', boxShadow: '0 8px 20px rgba(39, 174, 96, 0.4), inset 0 2px 4px rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.4)' }}>
            <span style={{ fontSize: '26px', color: 'white', fontWeight: '900', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>🚀</span>
         </div>
         
         <h2 style={{ margin: '0 0 5px 0', color: '#064e3b', fontSize: '1.7rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Creează cont</h2>
         <p style={{ color: '#059669', fontSize: '0.95rem', margin: '0 0 35px 0', fontWeight: '600' }}>Alătură-te comunității Mentorium.</p>

         <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            <input 
                type="text" name="nume" placeholder="Nume Complet" onChange={handleChange} required 
                style={{ width: '100%', padding: '15px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.6)', outline: 'none', fontSize: '15px', background: 'rgba(255,255,255,0.6)', color: '#064e3b', fontWeight: '500', transition: 'all 0.3s ease', boxSizing: 'border-box', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.02)' }}
                onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.background = 'rgba(255,255,255,0.9)'; e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.2)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.6)'; e.target.style.background = 'rgba(255,255,255,0.6)'; e.target.style.boxShadow = 'inset 0 2px 5px rgba(0,0,0,0.02)'; }}
            />

            <input 
                type="email" name="email" placeholder="Adresa de email" onChange={handleChange} required 
                style={{ width: '100%', padding: '15px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.6)', outline: 'none', fontSize: '15px', background: 'rgba(255,255,255,0.6)', color: '#064e3b', fontWeight: '500', transition: 'all 0.3s ease', boxSizing: 'border-box', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.02)' }}
                onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.background = 'rgba(255,255,255,0.9)'; e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.2)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.6)'; e.target.style.background = 'rgba(255,255,255,0.6)'; e.target.style.boxShadow = 'inset 0 2px 5px rgba(0,0,0,0.02)'; }}
            />
            
            <input 
                type="password" name="parola" placeholder="Parola securizată" onChange={handleChange} required 
                style={{ width: '100%', padding: '15px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.6)', outline: 'none', fontSize: '15px', background: 'rgba(255,255,255,0.6)', color: '#064e3b', fontWeight: '500', transition: 'all 0.3s ease', boxSizing: 'border-box', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.02)' }}
                onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.background = 'rgba(255,255,255,0.9)'; e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.2)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.6)'; e.target.style.background = 'rgba(255,255,255,0.6)'; e.target.style.boxShadow = 'inset 0 2px 5px rgba(0,0,0,0.02)'; }}
            />
            
            <motion.button 
                whileHover={{ scale: 1.03, boxShadow: '0 10px 25px rgba(39, 174, 96, 0.3)' }} 
                whileTap={{ scale: 0.97 }} 
                type="submit" 
                disabled={isLoading}
                style={{ 
                    marginTop: '10px', 
                    padding: '16px', 
                    background: isLoading ? '#cbd5e1' : 'linear-gradient(135deg, #10b981, #059669)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '16px', 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    cursor: isLoading ? 'not-allowed' : 'pointer', 
                    transition: 'all 0.3s',
                    boxShadow: isLoading ? 'none' : '0 4px 15px rgba(16, 185, 129, 0.3)'
                }}
            >
                {isLoading ? 'Se creează...' : 'Începe acum'}
            </motion.button>
         </form>
         
         <p style={{ marginTop: '30px', marginBottom: 0, fontSize: '14px', color: '#047857', fontWeight: '600' }}>
            Ai deja cont? <Link to="/login" style={{ color: '#10b981', fontWeight: '900', textDecoration: 'none' }}>Loghează-te</Link>
         </p>
      </motion.div>
    </div>
  );
}

export default Register;