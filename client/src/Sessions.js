import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

function Sessions() {
    const [sessions, setSessions] = useState([]);
    const [myEnrollments, setMyEnrollments] = useState([]);
    const [participants, setParticipants] = useState({});
    const [formData, setFormData] = useState({
        titlu: '', materie: 'Matematica', dataOra: '', pret: 20, linkMeet: ''
    });

    // Stare pentru fereastra de confirmare
    const [modal, setModal] = useState({ show: false, message: '', onConfirm: null });
    
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
            .then(data => setSessions(data))
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
        } catch (err) { console.error(err); }
    };

    const isLinkActive = (sessionDateString) => {
        const sessionTime = new Date(sessionDateString).getTime();
        const currentTime = new Date().getTime();
        return currentTime >= (sessionTime - 10 * 60 * 1000);
    };

    // Funcție pentru a deschide fereastra personalizată
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
            return toast.error("⚠️ Nu poți programa o meditație în trecut!");
        }

        try {
            const response = await fetch('http://localhost:5000/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, hostId: user.id })
            });

            if (response.ok) {
                toast.success("✅ Sesiune creată cu succes!");
                fetchSessions();
            } else {
                toast.error("Eroare la creare.");
            }
        } catch (err) { console.error(err); }
    };

    // Logica efectivă de Join (separată ca să poată fi apelată după confirmare)
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
        if (!user) return toast.info("Trebuie să fii logat!");
        // Aici deschidem modalul nostru în loc de window.confirm
        confirmAction(
            `Plătești ${pret} puncte pentru a te înscrie?`, 
            () => executeJoin(sessionId)
        );
    };

    // Logica efectivă de Cancel
    const executeCancel = async (sessionId) => {
        await fetch(`http://localhost:5000/api/sessions/${sessionId}`, { method: 'DELETE' });
        toast.info("Sesiune anulată.");
        fetchSessions();
    };

    const handleCancelClick = (sessionId) => {
        confirmAction(
            "Sigur vrei să anulezi? Banii vor fi returnați studenților.", 
            () => executeCancel(sessionId)
        );
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Meditații & Sesiuni Live</h2>

            {/* AICI ESTE FEREASTRA MODALĂ INVIZIBILĂ PÂNĂ CÂND E NEVOIE DE EA */}
            {modal.show && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirmare</h3>
                        <p>{modal.message}</p>
                        <div className="modal-buttons">
                            <button className="btn-cancel" onClick={() => setModal({ show: false })}>Nu</button>
                            <button className="btn-confirm" onClick={modal.onConfirm}>Da, sunt sigur</button>
                        </div>
                    </div>
                </div>
            )}

            {user && (
                <div className="card" style={{ marginBottom: '30px', background: '#f0f3f4', border: '1px solid #ddd' }}>
                    <h3>➕ Ține o oră de meditație</h3>
                    <form onSubmit={handleCreate} style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                        <input type="text" placeholder="Titlu" onChange={e => setFormData({...formData, titlu: e.target.value})} required style={{flex: 1}} />
                        <select onChange={e => setFormData({...formData, materie: e.target.value})} style={{padding: '10px'}}>
                            <option value="Matematica">Matematică</option>
                            <option value="Informatica">Informatică</option>
                            <option value="Engleza">Engleză</option>
                            <option value="Fizica">Fizică</option>
                        </select>
                        <input type="datetime-local" min={minDateTime} onChange={e => setFormData({...formData, dataOra: e.target.value})} required />
                        <input type="number" placeholder="Preț" style={{width: '80px'}} onChange={e => setFormData({...formData, pret: e.target.value})} required />
                        <input type="text" placeholder="Link Meet" style={{flex: 1}} onChange={e => setFormData({...formData, linkMeet: e.target.value})} required />
                        <button type="submit" style={{background: '#27ae60'}}>Publică</button>
                    </form>
                </div>
            )}

            <div className="grid-container">
                {sessions.map(s => {
                    const isHost = user && s.hostId === user.id;
                    const isEnrolled = myEnrollments.includes(s.id);
                    const linkReady = isLinkActive(s.dataOra);
                    const displayDate = s.dataOra ? s.dataOra.replace('T', ' ') : '?';

                    return (
                        <div key={s.id} className="card" style={{ width: '320px', borderTop: isEnrolled ? '5px solid #27ae60' : '5px solid #3498db', position: 'relative' }}>
                            <span style={{position: 'absolute', top: '10px', right: '10px', fontSize: '11px', background: '#eee', padding: '2px 8px', borderRadius: '10px'}}>{s.materie}</span>
                            
                            <h3>{s.titlu}</h3>
                            <p>📅 {displayDate}</p>
                            <p style={{fontWeight: 'bold', color: '#2980b9'}}>{s.pret} Puncte</p>

                            {isHost ? (
                                <div>
                                    <button onClick={() => viewParticipants(s.id)} style={{background: '#f39c12', color: 'white', width: '100%', marginBottom: '5px'}}>
                                        👥 Vezi Participanți
                                    </button>
                                    
                                    {participants[s.id] && (
                                        <div style={{background: '#fff3cd', padding: '5px', fontSize: '12px', marginBottom: '10px'}}>
                                            <strong>Înscriși ({participants[s.id].length}):</strong>
                                            <ul style={{paddingLeft: '20px', margin: '5px 0'}}>
                                                {participants[s.id].map((p, idx) => (
                                                    <li key={idx}>{p.nume} ({p.email})</li>
                                                ))}
                                                {participants[s.id].length === 0 && <li>Nimeni încă.</li>}
                                            </ul>
                                        </div>
                                    )}

                                    <button onClick={() => handleCancelClick(s.id)} style={{background: '#c0392b', color: 'white', width: '100%'}}>
                                        ❌ Anulează
                                    </button>
                                </div>
                            ) : isEnrolled ? (
                                <div>
                                    <p style={{color: 'green', fontWeight: 'bold', textAlign: 'center', margin: '5px'}}>✅ Ești înscris!</p>
                                    
                                    {linkReady ? (
                                        <a href={s.linkMeet} target="_blank" rel="noreferrer" style={{display: 'block', textAlign: 'center', background: '#27ae60', color: 'white', padding: '10px', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold'}}>
                                            📹 Intră în Meet
                                        </a>
                                    ) : (
                                        <div style={{background: '#eee', color: '#555', padding: '10px', textAlign: 'center', borderRadius: '5px', fontSize: '12px'}}>
                                            🔒 Link-ul apare cu 10 minute înainte de oră.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button onClick={() => handleJoinClick(s.id, s.pret)} style={{background: '#2980b9', color: 'white', width: '100%'}}>
                                    Înscrie-te
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Sessions;