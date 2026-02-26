import { useEffect, useState } from 'react';

function Marketplace() {
    const [resources, setResources] = useState([]);
    const [filteredResources, setFilteredResources] = useState([]);
    const [myPurchases, setMyPurchases] = useState([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Toate');
    
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetch('http://localhost:5000/api/resources')
            .then(res => res.json())
            .then(data => {
                setResources(data);
                setFilteredResources(data); 
            });

        if (user) {
            fetch(`http://localhost:5000/api/purchases/${user.id}`)
                .then(res => res.json())
                .then(ids => setMyPurchases(ids))
                .catch(err => console.error(err));
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


    const cumparaMaterial = async (resourceId, pret) => {
        if (!user) return alert("Trebuie să fii logat!");
        if (!window.confirm(`Cumperi cu ${pret} puncte?`)) return;

        try {
            const response = await fetch('http://localhost:5000/api/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ buyerId: user.id, resourceId })
            });
            const data = await response.json();

            if (response.ok) {
                alert(`Succes!`);
                user.wallet = data.newBalance;
                localStorage.setItem('user', JSON.stringify(user));
                setMyPurchases([...myPurchases, resourceId]);
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const descarcaFisier = (numeFisier) => {
        window.open(`http://localhost:5000/uploads/${numeFisier}`, '_blank');
    };

    return (
        <div>
            <h2>Marketplace</h2>

            <div className="card" style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input 
                    type="text" 
                    placeholder="Caută curs..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: '200px' }}
                />
                
                <select 
                    value={categoryFilter} 
                    onChange={e => setCategoryFilter(e.target.value)}
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                    <option value="Toate">Toate Materiile</option>
                    <option value="Informatica">Informatică</option>
                    <option value="Matematica">Matematică</option>
                    <option value="Economie">Economie</option>
                    <option value="Fizica">Fizică</option>
                    <option value="Altele">Altele</option>
                </select>
            </div>

            <div className="grid-container">
                {filteredResources.map(res => {
                    const isOwner = user && (res.userId === user.id || myPurchases.includes(res.id));

                    return (
                        <div key={res.id} className="card" style={{ width: '300px', position: 'relative' }}>
                           
                            <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#eee', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>
                                {res.categorie}
                            </span>

                            <div style={{ height: '150px', background: '#f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', borderRadius: '4px' }}>
                                {res.numeFisier.match(/\.(jpg|png|jpeg)$/i) ? 
                                    <img src={`http://localhost:5000/uploads/${res.numeFisier}`} style={{ maxHeight: '100%', maxWidth: '100%' }} alt="preview" /> 
                                    : <span style={{ fontSize: '30px' }}>📄</span>}
                            </div>

                            <h3>{res.titlu}</h3>
                            <p>{res.descriere}</p>
                            
                            <div style={{ marginTop: '15px' }}>
                                {isOwner ? (
                                    <button onClick={() => descarcaFisier(res.numeFisier)} style={{ backgroundColor: '#27ae60', color: 'white', width: '100%' }}>
                                        Descarcă
                                    </button>
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold', color: '#2980b9' }}>{res.pret} pct</span>
                                        <button onClick={() => cumparaMaterial(res.id, res.pret)} style={{ backgroundColor: '#2980b9', color: 'white' }}>
                                            Cumpără
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                
                {filteredResources.length === 0 && <p>Niciun rezultat găsit.</p>}
            </div>
        </div>
    );
}

export default Marketplace;