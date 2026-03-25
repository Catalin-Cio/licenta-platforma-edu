import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function WelcomeModal({ user }) {
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Dacă avem un user logat, verificăm dacă a mai văzut onboarding-ul
        if (user) {
            const hasSeen = localStorage.getItem(`onboarding_${user.id}`);
            if (!hasSeen) {
                // Îi dăm un mic delay de 1 secundă ca să aibă timp să se încarce pagina din spate
                const timer = setTimeout(() => setShow(true), 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [user]);

    const handleClose = () => {
        // Marcăm în browser că acest user a văzut mesajul
        localStorage.setItem(`onboarding_${user.id}`, 'true');
        setShow(false);
    };

    const goTo = (path) => {
        handleClose();
        navigate(path);
    };

    // Dacă nu trebuie să-l arătăm, nu randăm nimic
    if (!show) return null;

    return (
        <AnimatePresence>
            <div 
                style={{ 
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', 
                    zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}
            >
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 50 }}
                    transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(20px)',
                        padding: '40px',
                        borderRadius: '24px',
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.5)',
                        textAlign: 'center',
                        position: 'relative'
                    }}
                >
                    <button onClick={handleClose} style={{ position: 'absolute', top: '15px', right: '20px', background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>✕</button>
                    
                    <div style={{ fontSize: '50px', marginBottom: '15px' }}>🎉</div>
                    <h2 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '1.8rem' }}>
                        Bun venit, {user.nume.split(' ')[0]}!
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '1.1rem' }}>Suntem bucuroși să te avem în comunitatea Mentorium. Iată cu ce să începi:</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left', marginBottom: '30px' }}>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.7)', padding: '15px', borderRadius: '16px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} onClick={() => goTo('/marketplace')} onMouseOver={e => e.currentTarget.style.transform='scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'}>
                            <div style={{ fontSize: '30px' }}>🛒</div>
                            <div>
                                <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Marketplace</div>
                                <div style={{ fontSize: '13px', color: '#64748b' }}>Descoperă sau vinde materiale de studiu.</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.7)', padding: '15px', borderRadius: '16px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} onClick={() => goTo('/learn')} onMouseOver={e => e.currentTarget.style.transform='scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'}>
                            <div style={{ fontSize: '30px' }}>🧠</div>
                            <div>
                                <div style={{ fontWeight: 'bold', color: '#8e44ad' }}>AI Tutor</div>
                                <div style={{ fontSize: '13px', color: '#64748b' }}>Învață inteligent cu asistentul nostru virtual.</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.7)', padding: '15px', borderRadius: '16px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} onClick={() => goTo('/sessions')} onMouseOver={e => e.currentTarget.style.transform='scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'}>
                            <div style={{ fontSize: '30px' }}>📹</div>
                            <div>
                                <div style={{ fontWeight: 'bold', color: '#27ae60' }}>Meditații Live</div>
                                <div style={{ fontSize: '13px', color: '#64748b' }}>Participă sau predă sesiuni video direct pe platformă.</div>
                            </div>
                        </div>

                    </div>

                    <button 
                        onClick={handleClose}
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #3498db, #9b59b6)',
                            color: 'white',
                            border: 'none',
                            padding: '16px',
                            borderRadius: '16px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(52, 152, 219, 0.4)',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Să începem explorarea! 🚀
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export default WelcomeModal;