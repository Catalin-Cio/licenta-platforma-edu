import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function NotFound() {
    const navigate = useNavigate();

    return (
        <div style={{ 
            minHeight: 'calc(100vh - 200px)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            textAlign: 'center',
            padding: '20px'
        }}>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(20px)',
                    padding: '50px',
                    borderRadius: '30px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255,255,255,0.5)',
                    maxWidth: '500px',
                    width: '100%'
                }}
            >
                <motion.div 
                    animate={{ y: [-10, 10, -10] }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    style={{ fontSize: '80px', marginBottom: '20px' }}
                >
                    🛸
                </motion.div>
                
                <h1 style={{ fontSize: '4rem', margin: '0 0 10px 0', color: '#0f172a', fontWeight: '900', letterSpacing: '-2px' }}>404</h1>
                <h2 style={{ fontSize: '1.5rem', margin: '0 0 15px 0', color: '#334155' }}>Ai ieșit de pe hartă!</h2>
                
                <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '1.1rem', lineHeight: '1.5' }}>
                    Se pare că ai ajuns într-o zonă neexplorată a galaxiei Mentorium. Pagina pe care o cauți nu există sau a fost mutată.
                </p>

                <button 
                    onClick={() => navigate('/')}
                    style={{
                        background: 'linear-gradient(135deg, #3498db, #9b59b6)',
                        color: 'white',
                        border: 'none',
                        padding: '15px 30px',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(52, 152, 219, 0.4)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Întoarce-te în siguranță (Acasă)
                </button>
            </motion.div>
        </div>
    );
}

export default NotFound;