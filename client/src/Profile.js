import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

function Profile() {
    const [myUploads, setMyUploads] = useState([]);
    const [myPurchases, setMyPurchases] = useState([]);
    const [activity, setActivity] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [user, setUser] = useState(null);
    
    // Stare nouă: Controlează ce arată pop-up-ul (null înseamnă închis)
    const [modalContent, setModalContent] = useState(null); 
    
    const [stats, setStats] = useState({ uploads: 0, purchases: 0, sessions: 0 });

    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const areaChartData = [
        { name: 'Luni', activitate: 12 }, { name: 'Marți', activitate: 19 },
        { name: 'Mier', activitate: 15 }, { name: 'Joi', activitate: 25 },
        { name: 'Vin', activitate: 22 }, { name: 'Sâm', activitate: 30 },
        { name: 'Dum', activitate: 28 },
    ];

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        if (!loggedInUser) {
            navigate('/login');
            return;
        }
        setUser(loggedInUser);

        const fetchAllData = async () => {
            try {
                // 1. Materiale încărcate de mine
                const resUploads = await fetch(`http://localhost:5000/api/my-resources/${loggedInUser.id}`);
                const uploadsData = await resUploads.json();
                setMyUploads(uploadsData);

                // 2. Activitatea Financiară
                const resActivity = await fetch(`http://localhost:5000/api/my-activity/${loggedInUser.id}`);
                const activityData = await resActivity.json();
                setActivity(activityData);
                
                let venituri = 0; let cheltuieli = 0;
                activityData.forEach(item => {
                    if (item.direction === 'in') venituri += item.pret;
                    if (item.direction === 'out') cheltuieli += item.pret;
                });

                if (venituri > 0 || cheltuieli > 0) {
                    setChartData([
                        { name: 'Venituri', value: venituri, color: '#27ae60' },
                        { name: 'Cheltuieli', value: cheltuieli, color: '#e74c3c' }
                    ]);
                }

                // 3. Aducem ID-urile cumpărate și apoi materialele complete
                const resPurchasesIds = await fetch(`http://localhost:5000/api/purchases/${loggedInUser.id}`);
                const purchasesIds = await resPurchasesIds.json();
                
                const resAllResources = await fetch('http://localhost:5000/api/resources');
                const allResources = await resAllResources.json();
                
                const boughtResources = allResources.filter(res => purchasesIds.includes(res.id));
                setMyPurchases(boughtResources);

                const resSessions = await fetch(`http://localhost:5000/api/my-enrollments/${loggedInUser.id}`);
                const sessionsData = await resSessions.json();

                setStats({
                    uploads: uploadsData.length,
                    purchases: purchasesIds.length,
                    sessions: sessionsData.length
                });

            } catch (err) { console.error(err); }
        };

        fetchAllData();
    }, [navigate]);

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await fetch(`http://localhost:5000/api/user/${user.id}/avatar`, { method: 'POST', body: formData });
            const data = await res.json();
            if (res.ok) {
                const updatedUser = { ...user, avatar: data.avatar };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            }
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Ești sigur că vrei să ștergi acest material?")) return;
        try {
            const response = await fetch(`http://localhost:5000/api/resources/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setMyUploads(myUploads.filter(item => item.id !== id));
                setStats(prev => ({ ...prev, uploads: prev.uploads - 1 }));
            }
        } catch (err) { console.error(err); }
    };

    const descarcaFisier = (numeFisier) => {
        window.open(`http://localhost:5000/uploads/${numeFisier}`, '_blank');
    };

    if (!user) return null;

    const avatarUrl = user.avatar && user.avatar !== 'default.png' 
        ? `http://localhost:5000/uploads/${user.avatar}` 
        : `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.nume}`;

    // COMPONENTA CARD TRANSFORMATĂ ÎN BUTON DE POP-UP
    const StatCard = ({ titlu, valoare, icon, type }) => (
        <motion.div 
            onClick={() => setModalContent(type)}
            whileHover={{ y: -5, scale: 1.02, boxShadow: '0 15px 30px rgba(52, 152, 219, 0.2)' }}
            whileTap={{ scale: 0.98 }}
            style={{ 
                flex: '1 1 200px', 
                background: 'rgba(255, 255, 255, 0.8)', 
                backdropFilter: 'blur(10px)',
                padding: '20px', 
                borderRadius: '16px', 
                border: '1px solid rgba(255,255,255,0.8)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px', 
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'background 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'}
        >
            <div style={{ fontSize: '35px', background: 'rgba(52, 152, 219, 0.1)', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px' }}>
                {icon}
            </div>
            <div>
                <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>{titlu}</div>
                <div style={{ color: '#2c3e50', fontSize: '26px', fontWeight: '900' }}>{valoare}</div>
            </div>
        </motion.div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '50px' }}>
            
            {/* --- POP-UP-UL PLUTITOR ELEGANT --- */}
            <AnimatePresence>
                {modalContent && (
                    <div 
                        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => setModalContent(null)}
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
                            onClick={(e) => e.stopPropagation()} // Oprește închiderea la click înăuntru
                            style={{ 
                                background: 'rgba(255, 255, 255, 0.95)', 
                                backdropFilter: 'blur(20px)',
                                padding: '30px', 
                                borderRadius: '24px', 
                                width: '90%', 
                                maxWidth: '900px', 
                                maxHeight: '85vh', 
                                overflowY: 'auto',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                position: 'relative'
                            }}
                        >
                            <button onClick={() => setModalContent(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '18px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#e2e8f0'} onMouseOut={e=>e.currentTarget.style.background='#f1f5f9'}>✕</button>
                            
                            <h2 style={{ color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginTop: '10px', fontSize: '1.8rem' }}>
                                {modalContent === 'uploads' && '📤 Materialele Încărcate de Mine'}
                                {modalContent === 'purchases' && '📚 Biblioteca Mea (Cumpărate)'}
                                {modalContent === 'sessions' && '📹 Calendar Sesiuni'}
                            </h2>

                            {/* CONȚINUT POP-UP: ÎNCĂRCATE */}
                            {modalContent === 'uploads' && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginTop: '20px' }}>
                                    {myUploads.map(item => (
                                        <div key={item.id} style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '16px', background: '#fff', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                            <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>{item.categorie || 'Altele'}</span>
                                            <div style={{ height: '100px', background: 'rgba(52, 152, 219, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', borderRadius: '10px', color: '#3498db' }}><span style={{ fontSize: '35px' }}>📄</span></div>
                                            <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#0f172a', flexGrow: 1 }}>{item.titlu}</h4>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ color: '#3498db', fontWeight: 'bold' }}>{item.pret} pct</span>
                                                <button onClick={() => handleDelete(item.id)} style={{ background: '#fee2e2', color: '#e74c3c', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Șterge</button>
                                            </div>
                                        </div>
                                    ))}
                                    {myUploads.length === 0 && <p style={{ color: '#64748b', fontStyle: 'italic', gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>Nu ai publicat niciun curs. Fii creativ și adaugă unul!</p>}
                                </div>
                            )}

                            {/* CONȚINUT POP-UP: CUMPĂRATE */}
                            {modalContent === 'purchases' && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginTop: '20px' }}>
                                    {myPurchases.map(item => (
                                        <div key={item.id} style={{ border: '1px solid rgba(39, 174, 96, 0.2)', padding: '20px', borderRadius: '16px', background: '#fff', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 10px rgba(39, 174, 96, 0.05)' }}>
                                            <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>{item.categorie || 'Altele'}</span>
                                            <div style={{ height: '100px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', borderRadius: '10px' }}><span style={{ fontSize: '35px' }}>✅</span></div>
                                            <h4 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#064e3b', flexGrow: 1 }}>{item.titlu}</h4>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button onClick={() => descarcaFisier(item.numeFisier)} style={{ flex: 1, backgroundColor: '#22c55e', color: 'white', borderRadius: '8px', padding: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: 'transform 0.1s' }} onMouseDown={e=>e.currentTarget.style.transform='scale(0.95)'} onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}>
                                                    Descarcă
                                                </button>
                                                <button onClick={() => { setModalContent(null); navigate('/learn', { state: { resourceId: item.id, titlu: item.titlu } }); }} style={{ flex: 1, backgroundColor: '#8b5cf6', color: 'white', borderRadius: '8px', padding: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', transition: 'transform 0.1s' }} onMouseDown={e=>e.currentTarget.style.transform='scale(0.95)'} onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}>
                                                    🧠 AI
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {myPurchases.length === 0 && <p style={{ color: '#64748b', fontStyle: 'italic', gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>Nu ai cumpărat niciun material încă. Descoperă Marketplace-ul!</p>}
                                </div>
                            )}

                            {/* CONȚINUT POP-UP: SESIUNI */}
                            {modalContent === 'sessions' && (
                                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                                    <div style={{ fontSize: '60px', marginBottom: '15px' }}>📹</div>
                                    <h3 style={{ color: '#0f172a', marginBottom: '10px', fontSize: '1.5rem' }}>Ești implicat în {stats.sessions} meditații</h3>
                                    <p style={{ color: '#64748b', marginBottom: '25px', fontSize: '1.1rem' }}>Sesiunile live (Meet/Zoom) și participanții se gestionează din calendar.</p>
                                    <button 
                                        onClick={() => { setModalContent(null); navigate('/sessions'); }} 
                                        style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)', transition: 'transform 0.2s' }}
                                        onMouseOver={e=>e.currentTarget.style.transform='scale(1.05)'}
                                        onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}
                                    >
                                        Deschide Calendarul Live
                                    </button>
                                </div>
                            )}

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- RESTUL PAGINII DE PROFIL --- */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '30px', background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileInputRef.current.click()}>
                    <img src={avatarUrl} alt="Avatar" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #4a90e2', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', transition: 'transform 0.2s', backgroundColor: '#ecf0f1' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'} />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#4a90e2', color: 'white', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px', border: '3px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>📷</div>
                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" style={{ display: 'none' }} />
                </div>

                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '2.2rem' }}>{user.nume}</h2>
                    <p style={{ margin: '0 0 15px 0', color: '#7f8c8d', fontSize: '1.1rem' }}>{user.email}</p>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Portofel Puncte</p>
                    <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #27ae60, #2ecc71)', padding: '12px 25px', borderRadius: '20px', color: 'white', boxShadow: '0 8px 15px rgba(39, 174, 96, 0.3)' }}>
                        <span style={{ fontWeight: '900', fontSize: '1.8rem' }}>{user.wallet} <span style={{fontSize: '1rem', fontWeight: 'bold'}}>pct</span></span>
                    </div>
                </div>
            </div>

            {/* BUTOANELE CARE DESCHID POP-UP-UL */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
                <StatCard titlu="Încărcate" valoare={stats.uploads} icon="📤" type="uploads" />
                <StatCard titlu="Bilioteca Mea" valoare={stats.purchases} icon="📚" type="purchases" />
                <StatCard titlu="Sesiuni" valoare={stats.sessions} icon="📹" type="sessions" />
            </div>

            {/* ZONA FINANCIARĂ ȘI ISTORIC */}
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginBottom: '40px' }}>
                <div className="card" style={{ flex: '1', minWidth: '300px', padding: '25px', borderRadius: '20px' }}>
                    <h3 style={{ borderBottom: '2px solid #ecf0f1', paddingBottom: '10px', marginTop: 0, color: '#2c3e50' }}>Raport Financiar</h3>
                    {chartData.length > 0 ? (
                        <div style={{ width: '100%', height: '240px' }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" isAnimationActive={true}>
                                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value} pct`} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#95a5a6', fontStyle: 'italic' }}>Fără activitate financiară.</div>
                    )}
                </div>

                <div className="card" style={{ flex: '2', minWidth: '400px', padding: '25px', borderRadius: '20px' }}>
                    <h3 style={{ borderBottom: '2px solid #ecf0f1', paddingBottom: '10px', marginTop: 0, color: '#2c3e50' }}>Evoluție Platformă (7 Zile)</h3>
                    <div style={{ width: '100%', height: '240px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorActivitate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3498db" stopOpacity={0.5}/>
                                        <stop offset="95%" stopColor="#3498db" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7f8c8d' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7f8c8d' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="activitate" stroke="#3498db" strokeWidth={3} fillOpacity={1} fill="url(#colorActivitate)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card" style={{ flex: '1', minWidth: '350px', padding: '25px', borderRadius: '20px', maxHeight: '350px', overflowY: 'auto' }}>
                    <h3 style={{ borderBottom: '2px solid #ecf0f1', paddingBottom: '10px', marginTop: 0, color: '#2c3e50' }}>Istoric Tranzacții</h3>
                    {activity.length === 0 ? (
                        <p style={{ color: '#95a5a6', textAlign: 'center', marginTop: '60px', fontStyle: 'italic' }}>Nicio activitate recentă.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {activity.map((item, idx) => {
                                const isIncome = item.direction === 'in';
                                return (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '10px', borderLeft: `5px solid ${isIncome ? '#27ae60' : '#e74c3c'}` }}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 'bold', color: '#2c3e50', fontSize: '14px' }}>{item.titlu}</p>
                                            <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#7f8c8d' }}>{new Date(item.data).toLocaleDateString('ro-RO')} • {item.type}</p>
                                        </div>
                                        <div style={{ fontWeight: '900', fontSize: '1.1rem', color: isIncome ? '#27ae60' : '#e74c3c' }}>
                                            {isIncome ? '+' : '-'}{item.pret} pct
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default Profile;