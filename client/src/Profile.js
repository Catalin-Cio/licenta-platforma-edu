import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const [myUploads, setMyUploads] = useState([]);
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

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch(`http://localhost:5000/api/user/${user.id}/avatar`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (response.ok) {
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

    if (!user) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

    const avatarUrl = user.avatar && user.avatar !== 'default.png' 
        ? `http://localhost:5000/uploads/${user.avatar}` 
        : `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.nume}`;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ color: '#2c3e50', marginBottom: '30px' }}>Profilul Meu</h1>
            
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px', background: '#fff', padding: '30px', borderRadius: '15px' }}>
                <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileInputRef.current.click()}>
                    <img 
                        src={avatarUrl} 
                        alt="Avatar" 
                        style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #4a90e2', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#4a90e2', color: 'white', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', border: '3px solid white' }}>
                        📷
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" style={{ display: 'none' }} />
                </div>

                <div>
                    <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '2rem' }}>{user.nume}</h2>
                    <p style={{ margin: '0 0 15px 0', color: '#7f8c8d', fontSize: '1.1rem' }}>{user.email}</p>
                    <div style={{ display: 'inline-block', background: 'rgba(39, 174, 96, 0.1)', padding: '8px 15px', borderRadius: '20px', border: '1px solid #27ae60' }}>
                        <span style={{ color: '#27ae60', fontWeight: 'bold', fontSize: '1.2rem' }}>{user.wallet} Puncte</span>
                    </div>
                </div>
            </div>

            <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' }}>Materialele încărcate de mine</h2>
            <div className="grid-container">
                {myUploads.map(item => (
                    <div key={item.id} className="card" style={{ width: '250px', position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#ecf0f1', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', color: '#2c3e50' }}>
                            {item.categorie || 'Altele'}
                        </span>
                        <h4 style={{ marginTop: '25px', color: '#34495e' }}>{item.titlu}</h4>
                        <p style={{ color: '#2980b9', fontWeight: 'bold', fontSize: '1.1rem' }}>{item.pret} pct</p>
                        <button 
                            onClick={() => handleDelete(item.id)}
                            style={{ backgroundColor: '#e74c3c', color: 'white', width: '100%', borderRadius: '8px', marginTop: '10px' }}
                        >
                            🗑️ Șterge
                        </button>
                    </div>
                ))}
                
                {myUploads.length === 0 && (
                    <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>Nu ai încărcat niciun material încă.</p>
                )}
            </div>
        </div>
    );
}

export default Profile;