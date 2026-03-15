import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Profile() {
    const [myUploads, setMyUploads] = useState([]);
    const [activity, setActivity] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [user, setUser] = useState(null);
    
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        if (!loggedInUser) {
            navigate('/login');
            return;
        }
        setUser(loggedInUser);

        // Aducem materialele încărcate de utilizator
        fetch(`http://localhost:5000/api/my-resources/${loggedInUser.id}`)
            .then(res => res.json())
            .then(data => setMyUploads(data))
            .catch(err => console.error(err));

        // Aducem istoricul tranzacțiilor pentru noul Dashboard Financiar
        fetch(`http://localhost:5000/api/my-activity/${loggedInUser.id}`)
            .then(res => res.json())
            .then(data => {
                setActivity(data);
                
                let venituri = 0;
                let cheltuieli = 0;
                data.forEach(item => {
                    if (item.direction === 'in') venituri += item.pret;
                    if (item.direction === 'out') cheltuieli += item.pret;
                });

                if (venituri > 0 || cheltuieli > 0) {
                    setChartData([
                        { name: 'Venituri', value: venituri, color: '#27ae60' },
                        { name: 'Cheltuieli', value: cheltuieli, color: '#e74c3c' }
                    ]);
                }
            })
            .catch(err => console.error(err));
    }, [navigate]);

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await fetch(`http://localhost:5000/api/user/${user.id}/avatar`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (res.ok) {
                const updatedUser = { ...user, avatar: data.avatar };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            } else {
                alert("Eroare la încărcare!");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Ești sigur că vrei să ștergi acest material?")) return;
        try {
            const response = await fetch(`http://localhost:5000/api/resources/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setMyUploads(myUploads.filter(item => item.id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (!user) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

    // LOGICA TA ORIGINALĂ SUPERBĂ PENTRU GENERARE AVATARE DICEBEAR:
    const avatarUrl = user.avatar && user.avatar !== 'default.png' 
        ? `http://localhost:5000/uploads/${user.avatar}` 
        : `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.nume}`;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', paddingBottom: '50px' }}>
            
            {/* DESIGN-UL TĂU ORIGINAL DE HEADER (Cu Avatarul mare de 120px) */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '30px', background: '#fff', padding: '30px', borderRadius: '15px' }}>
                <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileInputRef.current.click()}>
                    <img 
                        src={avatarUrl} 
                        alt="Avatar" 
                        style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #4a90e2', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', transition: 'transform 0.2s', backgroundColor: '#ecf0f1' }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#4a90e2', color: 'white', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px', border: '3px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                        📷
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" style={{ display: 'none' }} />
                </div>

                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '2.2rem' }}>{user.nume}</h2>
                    <p style={{ margin: '0 0 15px 0', color: '#7f8c8d', fontSize: '1.1rem' }}>{user.email}</p>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Balanță curentă</p>
                    <div style={{ display: 'inline-block', background: 'rgba(39, 174, 96, 0.1)', padding: '10px 20px', borderRadius: '25px', border: '1px solid #27ae60' }}>
                        <span style={{ color: '#27ae60', fontWeight: 'bold', fontSize: '1.5rem' }}>{user.wallet} <span style={{fontSize: '1rem'}}>pct</span></span>
                    </div>
                </div>
            </div>

            {/* ZONA NOUĂ: GRAFIC + ISTORIC */}
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginBottom: '40px' }}>
                
                {/* GRAFICUL INTERACTIV */}
                <div className="card" style={{ flex: '1', minWidth: '300px', padding: '25px', borderRadius: '15px' }}>
                    <h3 style={{ borderBottom: '2px solid #ecf0f1', paddingBottom: '10px', marginTop: 0, color: '#2c3e50' }}>Analiză Financiară</h3>
                    
                    {chartData.length > 0 ? (
                        <div style={{ width: '100%', height: '280px' }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        innerRadius={80}    /* Bara subțire și elegantă */
                                        outerRadius={100}   
                                        paddingAngle={5}
                                        dataKey="value"
                                        isAnimationActive={true}
                                        animationDuration={1500}
                                        animationEasing="ease-out"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value} puncte`} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#95a5a6', fontStyle: 'italic' }}>
                            Nu există tranzacții în cont.
                        </div>
                    )}
                </div>

                {/* ISTORICUL TRANZACȚIILOR */}
                <div className="card" style={{ flex: '2', minWidth: '350px', padding: '25px', borderRadius: '15px', maxHeight: '400px', overflowY: 'auto' }}>
                    <h3 style={{ borderBottom: '2px solid #ecf0f1', paddingBottom: '10px', marginTop: 0, color: '#2c3e50' }}>Istoric Tranzacții</h3>
                    
                    {activity.length === 0 ? (
                        <p style={{ color: '#95a5a6', textAlign: 'center', marginTop: '60px', fontStyle: 'italic' }}>Nicio activitate recentă.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {activity.map((item, idx) => {
                                const isIncome = item.direction === 'in';
                                return (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '10px', borderLeft: `5px solid ${isIncome ? '#27ae60' : '#e74c3c'}`, transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateX(5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateX(0)'}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 'bold', color: '#2c3e50', fontSize: '15px' }}>{item.titlu}</p>
                                            <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#7f8c8d' }}>
                                                {new Date(item.data).toLocaleDateString('ro-RO')} • {
                                                    item.type === 'file_bought' ? 'Curs Cumpărat' :
                                                    item.type === 'file_sold' ? 'Curs Vândut' :
                                                    item.type === 'session_joined' ? 'Meditație (Participant)' : 'Meditație (Host)'
                                                }
                                            </p>
                                        </div>
                                        <div style={{ fontWeight: '900', fontSize: '1.2rem', color: isIncome ? '#27ae60' : '#e74c3c' }}>
                                            {isIncome ? '+' : '-'}{item.pret} pct
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* JOS: UPLOAD-URILE MELE */}
            <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' }}>Materialele încărcate de mine</h2>
            <div className="grid-container" style={{ justifyContent: 'flex-start' }}>
                {myUploads.map(item => (
                    <div key={item.id} className="card" style={{ width: '250px', position: 'relative', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#ecf0f1', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', color: '#2c3e50' }}>
                            {item.categorie || 'Altele'}
                        </span>
                        
                        <div style={{ height: '120px', background: 'rgba(52, 152, 219, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', borderRadius: '8px', color: '#3498db' }}>
                            <span style={{ fontSize: '40px' }}>📄</span>
                        </div>
                        
                        <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50', flexGrow: 1 }}>{item.titlu}</h4>
                        <p style={{ color: '#2980b9', fontWeight: '900', fontSize: '1.1rem', margin: '0 0 15px 0' }}>{item.pret} pct</p>
                        
                        <button onClick={() => handleDelete(item.id)} style={{ backgroundColor: '#e74c3c', color: 'white', width: '100%', borderRadius: '8px', padding: '10px', fontWeight: 'bold' }}>
                            🗑️ Șterge
                        </button>
                    </div>
                ))}
                
                {myUploads.length === 0 && <p style={{ color: '#7f8c8d', fontStyle: 'italic', marginLeft: '10px' }}>Nu ai publicat niciun curs pe Marketplace.</p>}
            </div>
        </div>
    );
}

export default Profile;