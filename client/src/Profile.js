import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const [myUploads, setMyUploads] = useState([]);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        if (!loggedInUser) {
            navigate('/login');
            return;
        }
        setUser(loggedInUser);

        fetch(`http://localhost:5000/api/my-resources/${loggedInUser.id}`)
            .then(res => res.json())
            .then(data => setMyUploads(data))
            .catch(err => console.error(err));
    }, [navigate]);

    const handleDelete = async (id) => {
        if (!window.confirm("Ești sigur?")) return;

        try {
            const response = await fetch(`http://localhost:5000/api/resources/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setMyUploads(myUploads.filter(item => item.id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div>
            <h1>Profilul Meu</h1>
            
            <div className="card" style={{ maxWidth: '400px', marginBottom: '30px' }}>
                <h3>{user.nume}</h3>
                <p>{user.email}</p>
                <h2 style={{ color: '#27ae60', margin: '10px 0' }}>{user.wallet} Puncte</h2>
            </div>

            <h2>Upload-urile mele</h2>
            <div className="grid-container">
                {myUploads.map(item => (
                    <div key={item.id} className="card" style={{ width: '250px', position: 'relative' }}>
                        {/* Afișăm Categoria și aici */}
                        <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#eee', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>
                            {item.categorie || 'Altele'}
                        </span>

                        <h4>{item.titlu}</h4>
                        <p>{item.pret} pct</p>
                        <button 
                            onClick={() => handleDelete(item.id)}
                            style={{ backgroundColor: '#c0392b', color: 'white', width: '100%' }}
                        >
                            Șterge
                        </button>
                    </div>
                ))}
                
                {myUploads.length === 0 && <p>Nu ai încărcat niciun material încă (sau baza de date a fost resetată).</p>}
            </div>
        </div>
    );
}

export default Profile;