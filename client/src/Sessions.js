import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

function Sessions() {
    const [sessions, setSessions] = useState([]);
    const [myEnrollments, setMyEnrollments] = useState([]);
    const [participants, setParticipants] = useState({});
    const [formData, setFormData] = useState({
        titlu: '', materie: 'Matematica', dataOra: '', pret: 20, linkMeet: ''
    });
    const [modal, setModal] = useState({ show: false, message: '', onConfirm: null });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showParticipantsModal, setShowParticipantsModal] = useState({ show: false, sessionId: null });
    
    const user = JSON.parse(localStorage.getItem('user'));
    
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const minDateTime = now.toISOString().slice(0, 16);

    useEffect(() => {
        fetchSessions();
        if (user) fetchEnrollments();
    }, []);

    const fetchSessions = () => {
        fetch('http://localhost:5000/api/sessions')
            .then(res => res.json())
            .then(data => {
                const sorted = data.sort((a, b) => new Date(a.dataOra) - new Date(b.dataOra));
                setSessions(sorted);
            })
            .catch(err => console.error(err));
    };

    const fetchEnrollments = () => {
        if (!user) return;
        fetch(`http://localhost:5000/api/my-enrollments/${user.id}`)
            .then(res => res.json())
            .then(data => setMyEnrollments(data))
            .catch(err => console.error(err));
    };
    
    const viewParticipants = async (sessionId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}/participants`);
            const data = await response.json();
            setParticipants({ ...participants, [sessionId]: data });
            setShowParticipantsModal({ show: true, sessionId });
        } catch (err) { console.error(err); }
    };

    const isLinkActive = (sessionDateString) => {
        const sessionTime = new Date(sessionDateString).getTime();
        const currentTime = new Date().getTime();
        return currentTime >= (sessionTime - 10 * 60 * 1000); 
    };

    const confirmAction = (message, action) => {
        setModal({
            show: true,
            message,
            onConfirm: () => {
                action();
                setModal({ show: false, message: '', onConfirm: null });
            }
        });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const selectedDate = new Date(formData.dataOra);
        const currentDate = new Date();
        
        if (!formData.dataOra) return toast.warning("Alege data și ora!");
        if (selectedDate < currentDate) {
            return toast.error("Nu poți programa o meditație în trecut!");
        }

        try {
            const response = await fetch('http://localhost:5000/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, hostId: user.id })
            });

            if (response.ok) {
                toast.success("Sesiune creată cu succes!");
                setShowCreateModal(false); 
                setFormData({ titlu: '', materie: 'Matematica', dataOra: '', pret: 20, linkMeet: '' }); // Resetăm
                fetchSessions();
            } else {
                toast.error("Eroare la creare.");
            }
        } catch (err) { console.error(err); }
    };

    const executeJoin = async (sessionId) => {
        try {
            const response = await fetch('http://localhost:5000/api/sessions/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: user.id, sessionId })
            });
            
            const data = await response.json();
            if (response.ok) {
                toast.success("🎉 Te-ai înscris cu succes!");
                const updatedUser = { ...user, wallet: data.remainingWallet };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                fetchEnrollments();
            } else {
                toast.error(data.message);
            }
        } catch (err) { console.error(err); }
    };

    const handleJoinClick = (sessionId, pret) => {
        if (!user) return toast.info("Trebuie să fii logat pentru a te înscrie!");
        confirmAction(`Plătești ${pret} puncte pentru a te înscrie?`, () => executeJoin(sessionId));
    };

    const executeCancel = async (sessionId) => {
        await fetch(`http://localhost:5000/api/sessions/${sessionId}`, { method: 'DELETE' });
        toast.info("Sesiune anulată.");
        fetchSessions();
    };

    const handleCancelClick = (sessionId) => {
        confirmAction("Sigur vrei să anulezi? Punctele vor fi returnate studenților.", () => executeCancel(sessionId));
    };
    const mySessions = sessions.filter(s => (user && s.hostId === user.id) || myEnrollments.includes(s.id));
    const availableSessions = sessions.filter(s => !(user && s.hostId === user.id) && !myEnrollments.includes(s.id));

    const SessionCard = ({ s, isMine }) => {
        const isHost = user && s.hostId === user.id;
        const isEnrolled = myEnrollments.includes(s.id);
        const linkReady = isLinkActive(s.dataOra);
        
        const dateObj = new Date(s.dataOra);
        const day = dateObj.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' });
        const time = dateObj.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

        return (
            <motion.div 
                whileHover={{ y: -5 }}
                style={{ 
                    background: 'rgba(255, 255, 255, 0.7)', 
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px', 
                    padding: '20px', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)', 
                    border: '1px solid rgba(255,255,255,0.8)',
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: isHost ? '#f39c12' : isEnrolled ? '#27ae60' : '#3498db' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '12px', textAlign: 'center', minWidth: '60px' }}>
                        <div style={{ color: '#e74c3c', fontWeight: '900', fontSize: '14px', textTransform: 'uppercase' }}>{dateObj.toLocaleDateString('ro-RO', { month: 'short' })}</div>
                        <div style={{ color: '#1e293b', fontWeight: '900', fontSize: '22px' }}>{dateObj.getDate()}</div>
                    </div>
                    <span style={{ fontSize: '12px', background: '#e2e8f0', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>
                        {s.materie}
                    </span>
                </div>

                <h3 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '1.2rem', fontWeight: '800' }}>{s.titlu}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '14px', marginBottom: '15px', fontWeight: '500' }}>
                    <span>🕒</span> {time}
                </div>
                
                <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #f1f5f9' }}>
                    {isHost ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => viewParticipants(s.id)} style={{ flex: 1, background: '#f39c12', color: 'white', padding: '10px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>👥 Participanți</button>
                            <button onClick={() => handleCancelClick(s.id)} style={{ background: '#fee2e2', color: '#e74c3c', padding: '10px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>❌</button>
                        </div>
                    ) : isEnrolled ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ textAlign: 'center', color: '#27ae60', fontWeight: 'bold', fontSize: '14px' }}>✅ Ești înscris</div>
                            {linkReady ? (
                                <a href={s.linkMeet} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', background: '#27ae60', color: 'white', padding: '12px', textDecoration: 'none', borderRadius: '10px', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(39, 174, 96, 0.2)' }}>Intră în Meet</a>
                            ) : (
                                <div style={{ background: '#f1f5f9', color: '#64748b', padding: '10px', textAlign: 'center', borderRadius: '10px', fontSize: '12px', fontWeight: '600' }}>Link-ul se activează cu 10 min înainte</div>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '900', color: '#3498db', fontSize: '18px' }}>{s.pret} pct</span>
                            <button onClick={() => handleJoinClick(s.id, s.pret)} style={{ background: '#3498db', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(52, 152, 219, 0.2)' }}>Înscrie-te</button>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} style={{ paddingBottom: '50px' }}>
            <AnimatePresence>
                {modal.show && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-content" style={{ padding: '30px', borderRadius: '24px' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Ești sigur?</h3>
                            <p style={{ color: '#64748b', marginBottom: '25px' }}>{modal.message}</p>
                            <div className="modal-buttons" style={{ display: 'flex', gap: '15px' }}>
                                <button style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setModal({ show: false })}>Înapoi</button>
                                <button style={{ flex: 1, padding: '12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={modal.onConfirm}>Confirmă</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showParticipantsModal.show && (
                    <div className="modal-overlay" onClick={() => setShowParticipantsModal({ show: false, sessionId: null })}>
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} onClick={e => e.stopPropagation()} className="modal-content" style={{ padding: '30px', borderRadius: '24px', maxWidth: '400px', width: '90%' }}>
                            <h3 style={{ fontSize: '1.4rem', marginBottom: '5px', color: '#0f172a' }}>Participanți Înscriși</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Studenții care au plătit pentru această sesiune.</p>
                            
                            <div style={{ maxHeight: '300px', overflowY: 'auto', textAlign: 'left' }}>
                                {participants[showParticipantsModal.sessionId]?.length > 0 ? (
                                    participants[showParticipantsModal.sessionId].map((p, idx) => (
                                        <div key={idx} style={{ padding: '12px 15px', background: '#f8fafc', borderRadius: '12px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '30px', height: '30px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b' }}>{p.nume.charAt(0)}</div>
                                            <div>
                                                <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '14px' }}>{p.nume}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>{p.email}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px' }}>Nimeni nu s-a înscris încă.</div>
                                )}
                            </div>
                            <button onClick={() => setShowParticipantsModal({ show: false, sessionId: null })} style={{ width: '100%', padding: '12px', background: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' }}>Închide</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showCreateModal && (
                    <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="modal-content" style={{ padding: '35px', borderRadius: '24px', maxWidth: '500px', width: '90%', background: '#fff', textAlign: 'left' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.6rem' }}>Programează Meditație</h2>
                                <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
                            </div>
                            
                            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>Titlul Sesiunii</label>
                                    <input type="text" placeholder="Ex: Pregătire Test POO..." value={formData.titlu} onChange={e => setFormData({...formData, titlu: e.target.value})} required style={{ width: '100%', padding: '12px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }} />
                                </div>
                                
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>Materia</label>
                                        <select value={formData.materie} onChange={e => setFormData({...formData, materie: e.target.value})} style={{ width: '100%', padding: '12px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '15px', background: '#fff', boxSizing: 'border-box' }}>
                                            <option value="Matematica">Matematică</option>
                                            <option value="Informatica">Informatică</option>
                                            <option value="Engleza">Engleză</option>
                                            <option value="Fizica">Fizică</option>
                                            <option value="Altele">Altele</option>
                                        </select>
                                    </div>
                                    <div style={{ width: '100px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>Preț (pct)</label>
                                        <input type="number" min="0" value={formData.pret} onChange={e => setFormData({...formData, pret: e.target.value})} required style={{ width: '100%', padding: '12px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }} />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>Data și Ora</label>
                                    <input type="datetime-local" min={minDateTime} value={formData.dataOra} onChange={e => setFormData({...formData, dataOra: e.target.value})} required style={{ width: '100%', padding: '12px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }} />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>Link Întâlnire (Google Meet / Zoom)</label>
                                    <input type="url" placeholder="https://meet.google.com/..." value={formData.linkMeet} onChange={e => setFormData({...formData, linkMeet: e.target.value})} required style={{ width: '100%', padding: '12px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }} />
                                </div>

                                <button type="submit" style={{ background: '#27ae60', color: 'white', padding: '15px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)' }}>
                                    Publică Meditația
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#0f172a', fontSize: '2.2rem' }}>Dashboard Sesiuni</h1>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '1.1rem' }}>Gestionează-ți programul și descoperă meditații noi.</p>
                </div>
                {user && (
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        style={{ background: '#0f172a', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', transition: 'transform 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <span style={{ fontSize: '18px' }}>+</span> Programează Meditație
                    </button>
                )}
            </div>

            {user && (
                <div style={{ marginBottom: '50px' }}>
                    <h2 style={{ color: '#1e293b', borderBottom: '2px solid rgba(255,255,255,0.5)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span></span> Programul Meu
                    </h2>
                    {mySessions.length === 0 ? (
                        <div style={{ background: 'rgba(255,255,255,0.4)', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#64748b', border: '1px dashed #cbd5e1' }}>
                            Nu ai nicio meditație programată.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                            {mySessions.map(s => <SessionCard key={s.id} s={s} isMine={true} />)}
                        </div>
                    )}
                </div>
            )}
            <div>
                <h2 style={{ color: '#1e293b', borderBottom: '2px solid rgba(255,255,255,0.5)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span></span> Explorează Sesiuni Disponibile
                </h2>
                {availableSessions.length === 0 ? (
                    <div style={{ background: 'rgba(255,255,255,0.4)', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#64748b', border: '1px dashed #cbd5e1' }}>
                        Momentan nu există meditații disponibile la care să nu fii înscris.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                        {availableSessions.map(s => <SessionCard key={s.id} s={s} isMine={false} />)}
                    </div>
                )}
            </div>

        </motion.div>
    );
}

export default Sessions;