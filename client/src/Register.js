import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

function Register() {
  const [formData, setFormData] = useState({ nume: '', email: '', parola: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const bookEmojis = ['📚', '📖', '📕', '📗', '📘', '📙', '📓', '🎓', '✏️', '🖋️'];

  useEffect(() => {
    const interval = setInterval(() => {
      const newBook = {
        id: Date.now(),
        emoji: bookEmojis[Math.floor(Math.random() * bookEmojis.length)],
        // MAGIC FIX AICI: Folosim 'vw' pentru a le forța pe partea dreaptă a ecranului (între 65% și 95% din lățime)
        startX: Math.random() * 30 + 65 + 'vw', 
        duration: Math.random() * 3 + 12, 
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
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.parola)) {
        toast.warning('🔒 Parola trebuie să aibă minim 8 caractere, o majusculă și o cifră!');
        return; 
    }
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
      
      {/* Containerul pentru animații */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }}>
        {books.map((book) => (
          <motion.div
            key={book.id}
            initial={{ y: '110vh', x: book.startX, rotate: 0, opacity: 0 }}
            animate={{ 
                y: '-10vh', 
                rotate: book.rotation, 
                opacity: [0, 0.6, 0.6, 0] 
            }}
            transition={{ duration: book.duration, ease: 'linear' }}
            onAnimationComplete={() => removeBook(book.id)}
            style={{ 
                position: 'absolute', 
                fontSize: book.size, 
                textShadow: '0 5px 15px rgba(0,0,0,0.15)', 
                zIndex: -1 
            }}
          >
            {book.emoji}
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ duration: 0.4, ease: "easeOut" }}
        whileHover={{ y: -8, boxShadow: '0 15px 40px 0 rgba(39, 174, 96, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.4), inset 0 0 25px rgba(255, 255, 255, 0.5)' }}
        style={{ 
            width: '100%', 
            maxWidth: '350px', 
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.1) 100%)', 
            backdropFilter: 'blur(30px) saturate(150%)',
            WebkitBackdropFilter: 'blur(30px) saturate(150%)',
            borderRadius: '24px', 
            padding: '35px 25px', 
            boxShadow: '0 8px 32px 0 rgba(39, 174, 96, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.4), inset 0 0 25px rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            textAlign: 'center',
            zIndex: 1,
            transition: 'box-shadow 0.3s ease, transform 0.3s ease'
        }}
      >
         <h2 style={{ margin: '0 0 5px 0', color: '#064e3b', fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Creează cont</h2>
         <p style={{ color: '#059669', fontSize: '0.9rem', margin: '0 0 25px 0', fontWeight: '600' }}>Alătură-te comunității Mentorium.</p>

         <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <input 
                type="text" name="nume" placeholder="Nume Complet" onChange={handleChange} required 
                style={{ width: '100%', padding: '12px 15px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.6)', outline: 'none', fontSize: '14px', background: 'rgba(255,255,255,0.6)', color: '#064e3b', fontWeight: '500', transition: 'all 0.3s ease', boxSizing: 'border-box', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.02)' }}
                onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.background = 'rgba(255,255,255,0.9)'; e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.2)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.6)'; e.target.style.background = 'rgba(255,255,255,0.6)'; e.target.style.boxShadow = 'inset 0 2px 5px rgba(0,0,0,0.02)'; }}
            />

            <input 
                type="email" name="email" placeholder="Adresa de email" onChange={handleChange} required 
                style={{ width: '100%', padding: '12px 15px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.6)', outline: 'none', fontSize: '14px', background: 'rgba(255,255,255,0.6)', color: '#064e3b', fontWeight: '500', transition: 'all 0.3s ease', boxSizing: 'border-box', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.02)' }}
                onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.background = 'rgba(255,255,255,0.9)'; e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.2)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.6)'; e.target.style.background = 'rgba(255,255,255,0.6)'; e.target.style.boxShadow = 'inset 0 2px 5px rgba(0,0,0,0.02)'; }}
            />
            
            <input 
                type="password" name="parola" placeholder="Parola securizată" onChange={handleChange} required 
                style={{ width: '100%', padding: '12px 15px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.6)', outline: 'none', fontSize: '14px', background: 'rgba(255,255,255,0.6)', color: '#064e3b', fontWeight: '500', transition: 'all 0.3s ease', boxSizing: 'border-box', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.02)' }}
                onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.background = 'rgba(255,255,255,0.9)'; e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.2)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.6)'; e.target.style.background = 'rgba(255,255,255,0.6)'; e.target.style.boxShadow = 'inset 0 2px 5px rgba(0,0,0,0.02)'; }}
            />
            <small style={{ color: '#047857', fontSize: '11px', textAlign: 'left', marginTop: '-8px', paddingLeft: '5px' }}>* Minim 8 caractere, o majusculă și o cifră.</small>
            
            <motion.button 
                whileHover={{ scale: 1.03, boxShadow: '0 10px 25px rgba(39, 174, 96, 0.3)' }} 
                whileTap={{ scale: 0.97 }} 
                type="submit" 
                disabled={isLoading}
                style={{ 
                    marginTop: '5px', 
                    padding: '14px', 
                    background: isLoading ? '#cbd5e1' : 'linear-gradient(135deg, #10b981, #059669)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '14px', 
                    fontSize: '15px', 
                    fontWeight: 'bold', 
                    cursor: isLoading ? 'not-allowed' : 'pointer', 
                    transition: 'all 0.3s',
                    boxShadow: isLoading ? 'none' : '0 4px 15px rgba(16, 185, 129, 0.3)'
                }}
            >
                {isLoading ? 'Se creează...' : 'Începe acum'}
            </motion.button>
         </form>
         
         <p style={{ marginTop: '25px', marginBottom: 0, fontSize: '13px', color: '#047857', fontWeight: '600' }}>
            Ai deja cont? <Link to="/login" style={{ color: '#10b981', fontWeight: '900', textDecoration: 'none' }}>Loghează-te</Link>
         </p>
      </motion.div>
    </div>
  );
}

export default Register;