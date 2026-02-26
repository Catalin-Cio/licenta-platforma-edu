import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [resources, setResources] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'admin') {
            alert("Acces interzis! Nu ești Admin.");
            navigate('/dashboard');
            return;
        }

        fetchUsers();
        fetchResources();
    }, [navigate]);

    const fetchUsers = () => {
        fetch('http://localhost:5000/api/users')
            .then(res => res.json())
            .then(data => setUsers(data));
    };

    const fetchResources = () => {
        fetch('http://localhost:5000/api/resources')
            .then(res => res.json())
            .then(data => setResources(data));
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Ștergi acest utilizator?")) return;
        await fetch(`http://localhost:5000/api/users/${id}`, { method: 'DELETE' });
        fetchUsers();
    };

    const deleteResource = async (id) => {
        if (!window.confirm("Ștergi acest material?")) return;
        await fetch(`http://localhost:5000/api/resources/${id}`, { method: 'DELETE' });
        fetchResources();
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ color: 'red' }}>Panou Administrator 🛡️</h1>

            <h3>👥 Utilizatori ({users.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                <thead>
                    <tr style={{ background: '#ddd', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>ID</th>
                        <th>Nume</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Acțiuni</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px' }}>{u.id}</td>
                            <td>{u.nume}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>
                                {u.role !== 'admin' && (
                                    <button onClick={() => deleteUser(u.id)} style={{ background: 'red', color: 'white' }}>Ban</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3>📚 Toate Materialele ({resources.length})</h3>
            <div className="grid-container">
                {resources.map(res => (
                    <div key={res.id} className="card" style={{ width: '250px', border: '1px solid red' }}>
                        <h4>{res.titlu}</h4>
                        <p>{res.categorie}</p>
                        <p>User ID: {res.userId}</p>
                        <button onClick={() => deleteResource(res.id)} style={{ background: 'red', color: 'white', width: '100%' }}>
                            Șterge Forțat
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminPanel;