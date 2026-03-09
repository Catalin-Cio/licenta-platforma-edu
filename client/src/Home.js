import React, { useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import Marketplace from './Marketplace';

function Home() {
    const { scrollYProgress } = useScroll();

    // Efectul de Parallax la scroll
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const heroY = useTransform(scrollYProgress, [0, 0.3], ['0%', '-20%']);

    // Efectul de Aură (Spotlight pe Mouse)
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    
    const springConfig = { damping: 25, stiffness: 200 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e) => {
            cursorX.set(e.clientX - 300); 
            cursorY.set(e.clientY - 300);
        };
        window.addEventListener('mousemove', moveCursor);
        return () => window.removeEventListener('mousemove', moveCursor);
    }, [cursorX, cursorY]);

    return (
        // MODIFICARE AICI: Am scos overflow: hidden și am lăsat doar overflowX: hidden
        // Acum browserul te va lăsa să dai scroll pe verticală cât de mult vrei!
        <div style={{ position: 'relative', overflowX: 'hidden' }}>
            
            {/* --- LUMINA ALBĂ CARE URMĂREȘTE MOUSE-UL --- */}
            <motion.div
                style={{
                    position: 'fixed',
                    left: cursorXSpring,
                    top: cursorYSpring,
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%)',
                    pointerEvents: 'none', 
                    zIndex: 0,
                }}
            />

            {/* --- ECRANUL PRINCIPAL (Se fixează în fundal) --- */}
            <motion.div 
                style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    opacity: heroOpacity, y: heroY, zIndex: 1,
                }}
            >
                {/* SFERA 1 - Stânga Sus */}
                <motion.div
                    animate={{ y: [0, -30, 0], rotate: [0, 15, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        position: 'absolute', top: '15%', left: '20%', width: '180px', height: '180px',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.6), rgba(236,72,153,0.6))',
                        borderRadius: '50%', filter: 'blur(4px)', backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}
                />

                {/* SFERA 2 - Dreapta Jos */}
                <motion.div
                    animate={{ y: [0, 40, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    style={{
                        position: 'absolute', bottom: '20%', right: '25%', width: '250px', height: '250px',
                        background: 'linear-gradient(135deg, rgba(56,189,248,0.5), rgba(99,102,241,0.5))',
                        borderRadius: '50%', filter: 'blur(6px)', backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}
                />

                {/* TITLUL CINEMATIC */}
                <motion.h1 
                    initial={{ opacity: 0, y: 50, letterSpacing: '0px' }}
                    animate={{ opacity: 1, y: 0, letterSpacing: '4px' }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{
                        fontSize: '6rem', margin: 0, 
                        color: '#1e293b', 
                        fontWeight: '800',
                        textShadow: '0 4px 20px rgba(255,255,255,0.6)', 
                        zIndex: 2, textAlign: 'center'
                    }}
                >
                    Mentorium
                </motion.h1>
                
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    style={{ 
                        fontSize: '1.5rem', 
                        color: '#334155', 
                        marginTop: '20px', fontWeight: '500', zIndex: 2, letterSpacing: '1px' 
                    }}
                >
                    Viitorul educației. Modern. Rapid. Imersiv.
                </motion.p>

                <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ 
                        marginTop: '60px', fontSize: '1.2rem', 
                        color: '#64748b', 
                        zIndex: 2, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' 
                    }}
                >
                    ↓ Dă scroll pentru a explora ↓
                </motion.div>
            </motion.div>

            {/* --- MARKETPLACE-UL --- */}
            {/* MODIFICARE AICI: Am folosit marginTop: '100vh' în loc de absolute. 
                Asta îl face să se așeze frumos sub animație și să lase pagina să crească! */}
            <div style={{ marginTop: '100vh', width: '100%', position: 'relative', zIndex: 10 }}>
                <div style={{ 
                    background: 'rgba(255, 255, 255, 0.4)', 
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    minHeight: '100vh', 
                    borderTopLeftRadius: '40px', 
                    borderTopRightRadius: '40px', 
                    padding: '40px 20px',
                    boxShadow: '0 -20px 50px rgba(0,0,0,0.05)', 
                    borderTop: '1px solid rgba(255,255,255,0.6)' 
                }}>
                    <Marketplace />
                </div>
            </div>

        </div>
    );
}

export default Home;