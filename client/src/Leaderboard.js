import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function Leaderboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        setTimeout(() => {
            fetch('http://localhost:5000/api/leaderboard')
                .then(res => {
                    if (!res.ok) throw new Error("Eroare de la server");
                    return res.json();
                })
                .then(data => {
                    setUsers(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Eroare la preluarea clasamentului:", err);
                    setError(true);
                    setLoading(false);
                });
        }, 600);
    }, []);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h2 style={{ color: '#2c3e50', fontSize: '2.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>🏆 Top Studenți</h2>
                <p style={{ color: '#34495e', fontSize: '1.1rem', fontWeight: '500' }}>Fii activ, vinde materiale și ține meditații pentru a urca în clasament!</p>
            </div>

            {error ? (
                <p style={{ textAlign: 'center', color: '#e74c3c', fontWeight: 'bold', fontSize: '18px' }}>❌ Nu m-am putut conecta la server. Verifică dacă serverul Node.js este pornit!</p>
            ) : (
                <div style={{ 
                    maxWidth: '800px', 
                    margin: '0 auto', 
                    background: 'rgba(255, 255, 255, 0.35)', 
                    backdropFilter: 'blur(16px)', 
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '20px', 
                    padding: '25px', 
                    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)', 
                    border: '1px solid rgba(255, 255, 255, 0.5)' 
                }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '10px 15px', textAlign: 'left', color: '#2c3e50', borderBottom: '2px solid rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Rang</th>
                                <th style={{ padding: '10px 15px', textAlign: 'left', color: '#2c3e50', borderBottom: '2px solid rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Nume Student</th>
                                <th style={{ padding: '10px 15px', textAlign: 'right', color: '#2c3e50', borderBottom: '2px solid rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Scor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, index) => (
                                    <tr key={index} style={{ background: 'rgba(255, 255, 255, 0.45)', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                                        <td style={{ padding: '15px', borderRadius: '12px 0 0 12px' }}>
                                            <div className="skeleton skeleton-avatar"></div>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <div className="skeleton skeleton-title" style={{ margin: 0, width: '150px' }}></div>
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'right', borderRadius: '0 12px 12px 0', display: 'flex', justifyContent: 'flex-end' }}>
                                            <div className="skeleton skeleton-title" style={{ margin: 0, width: '80px' }}></div>
                                        </td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '20px', fontWeight: 'bold' }}>Niciun student în top încă.</td>
                                </tr>
                            ) : (
                                users.map((student, index) => {
                                    const isMe = currentUser && currentUser.id === student.id;
                                    
                                    return (
                                        <motion.tr 
                                            key={student.id} 
                                            initial={{ opacity: 0, x: -20 }} 
                                            animate={{ opacity: 1, x: 0 }} 
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ scale: 1.015, backgroundColor: isMe ? 'rgba(46, 204, 113, 0.4)' : 'rgba(255, 255, 255, 0.7)' }}
                                            style={{ 
                                                background: isMe ? 'rgba(46, 204, 113, 0.25)' : 'rgba(255, 255, 255, 0.45)',
                                                fontWeight: isMe ? 'bold' : '500',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
                                                cursor: 'default',
                                                transition: 'background-color 0.3s ease'
                                            }}
                                        >
                                            <td style={{ padding: '15px', fontSize: '1.2rem', borderRadius: '12px 0 0 12px' }}>
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : <span style={{ color: '#7f8c8d', fontSize: '1rem' }}>#{index + 1}</span>}
                                            </td>
                                            <td style={{ padding: '15px', color: '#2c3e50' }}>
                                                {student.nume} 
                                                {isMe && <span style={{ fontSize: '0.75rem', background: '#27ae60', color: 'white', padding: '3px 8px', borderRadius: '12px', marginLeft: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tu</span>}
                                            </td>
                                            <td style={{ padding: '15px', textAlign: 'right', color: '#2980b9', fontWeight: 'bold', fontSize: '1.1rem', borderRadius: '0 12px 12px 0' }}>
                                                {student.wallet} <span style={{ fontSize: '0.8rem', color: '#7f8c8d', fontWeight: 'normal' }}>pct</span>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
}

export default Leaderboard;