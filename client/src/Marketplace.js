import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function Marketplace() {
    const [resources, setResources] = useState([]);
    const [filteredResources, setFilteredResources] = useState([]);
    const [myPurchases, setMyPurchases] = useState([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Toate');
    const [modal, setModal] = useState({ show: false, message: '', onConfirm: null });

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetch('http://localhost:5000/api/resources')
            .then(res => res.json())
            .then(data => {
                setResources(data);
                setFilteredResources(data); 
            })
            .catch(err => console.error("Eroare la resurse:", err));

        if (user) {
            fetch(`http://localhost:5000/api/purchases/${user.id}`)
                .then(res => res.json())
                .then(ids => setMyPurchases(ids))
                .catch(err => console.error("Eroare achiziții:", err));
        }
    }, []);

    useEffect(() => {
        let results = resources;
        if (categoryFilter !== 'Toate') {
            results = results.filter(res => res.categorie === categoryFilter);
        }
        if (search !== '') {
            results = results.filter(res => res.titlu.toLowerCase().includes(search.toLowerCase()));
        }
        setFilteredResources(results);
    }, [search, categoryFilter, resources]);

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

    const executePurchase = async (resourceId, pret) => {
        try {
            const response = await fetch('http://localhost:5000/api/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ buyerId: user.id, resourceId })
            });
            const data = await response.json();

            if (response.ok) {
                toast.success("🎉 Ai cumpărat materialul cu succes!");
                user.wallet = data.newBalance;
                localStorage.setItem('user', JSON.stringify(user));
                setMyPurchases([...myPurchases, resourceId]);
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const cumparaMaterial = (resourceId, pret) => {
        if (!user) return toast.info("Trebuie să fii logat!");
        confirmAction(`Cumperi acest material cu ${pret} puncte?`, () => executePurchase(resourceId, pret));
    };

    const descarcaFisier = (numeFisier) => {
        window.open(`http://localhost:5000/uploads/${numeFisier}`, '_blank');
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            
            {modal.show && (
                <div className="modal-overlay">
                    <motion.div className="modal-content" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                        <h3>Confirmare</h3>
                        <p>{modal.message}</p>
                        <div className="modal-buttons">
                            <button className="btn-cancel" onClick={() => setModal({ show: false })}>Nu</button>
                            <button className="btn-confirm" onClick={modal.onConfirm}>Da, cumpără</button>
                        </div>
                    </motion.div>
                </div>
            )}

            <h2 style={{ color: '#2c3e50' }}>Marketplace</h2>

            <motion.div 
                className="card" 
                initial={{ y: -20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.2 }} 
                style={{ 
                    marginBottom: '20px', 
                    display: 'flex', 
                    gap: '10px', 
                    alignItems: 'center', 
                    flexWrap: 'wrap' 
                }}
            >
                <input 
                    type="text" 
                    placeholder="Caută curs..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    style={{ 
                        flex: 1, 
                        minWidth: '200px', 
                        padding: '10px', 
                        borderRadius: '8px', 
                        border: 'none', 
                        outline: 'none', 
                        background: 'rgba(255,255,255,0.7)' 
                    }} 
                />
                <select 
                    value={categoryFilter} 
                    onChange={e => setCategoryFilter(e.target.value)} 
                    style={{ 
                        padding: '10px', 
                        borderRadius: '8px', 
                        border: 'none', 
                        outline: 'none', 
                        background: 'rgba(255,255,255,0.7)' 
                    }}
                >
                    <option value="Toate">Toate Materiile</option>
                    <option value="Informatica">Informatică</option>
                    <option value="Matematica">Matematică</option>
                    <option value="Economie">Economie</option>
                    <option value="Fizica">Fizică</option>
                    <option value="Altele">Altele</option>
                </select>
            </motion.div>

            <div className="grid-container">
                {filteredResources.map((res, index) => {
                    const isOwner = user && (res.userId === user.id || myPurchases.includes(res.id));

                    return (
                        <motion.div 
                            key={res.id} 
                            className="card" 
                            initial={{ opacity: 0, y: 30 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ duration: 0.4, delay: index * 0.1 }} 
                            whileHover={{ y: -8, scale: 1.02 }} 
                            style={{ width: '260px', position: 'relative' }}
                        >
                            <span style={{ 
                                position: 'absolute', 
                                top: '10px', 
                                right: '10px', 
                                background: 'rgba(255,255,255,0.8)', 
                                padding: '4px 10px', 
                                borderRadius: '12px', 
                                fontSize: '12px', 
                                fontWeight: 'bold' 
                            }}>
                                {res.categorie}
                            </span>
                            
                            <div style={{ 
                                height: '150px', 
                                background: 'rgba(255,255,255,0.3)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                marginBottom: '15px', 
                                borderRadius: '10px' 
                            }}>
                                <span style={{ fontSize: '50px' }}>📄</span>
                            </div>
                            
                            <h3 style={{ margin: '10px 0' }}>{res.titlu}</h3>
                            <p style={{ color: '#555', height: '40px', overflow: 'hidden' }}>{res.descriere}</p>
                            
                            <div style={{ marginTop: '15px' }}>
                                {isOwner ? (
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button 
                                            onClick={() => descarcaFisier(res.numeFisier)} 
                                            style={{ 
                                                flex: 1, 
                                                backgroundColor: '#27ae60', 
                                                color: 'white', 
                                                borderRadius: '8px', 
                                                padding: '10px', 
                                                border: 'none', 
                                                cursor: 'pointer', 
                                                fontWeight: 'bold' 
                                            }}
                                        >
                                            Descarcă
                                        </button>
                                        <button 
                                            onClick={() => navigate('/learn', { state: { resourceId: res.id, titlu: res.titlu } })} 
                                            style={{ 
                                                flex: 1, 
                                                backgroundColor: '#8e44ad', 
                                                color: 'white', 
                                                borderRadius: '8px', 
                                                padding: '10px', 
                                                border: 'none', 
                                                cursor: 'pointer', 
                                                fontWeight: 'bold' 
                                            }}
                                        >
                                            🧠 Învață
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold', color: '#2980b9', fontSize: '18px' }}>
                                            {res.pret} pct
                                        </span>
                                        <button 
                                            onClick={() => cumparaMaterial(res.id, res.pret)} 
                                            style={{ 
                                                backgroundColor: '#2980b9', 
                                                color: 'white', 
                                                borderRadius: '8px', 
                                                padding: '10px 20px', 
                                                border: 'none', 
                                                cursor: 'pointer', 
                                                fontWeight: 'bold' 
                                            }}
                                        >
                                            Cumpără
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
                {filteredResources.length === 0 && <p style={{ fontWeight: 'bold' }}>Niciun rezultat găsit.</p>}
            </div>
        </motion.div>
    );
}

export default Marketplace;