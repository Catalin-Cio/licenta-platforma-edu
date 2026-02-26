import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Upload() {
    const [titlu, setTitlu] = useState('');
    const [descriere, setDescriere] = useState('');
    const [pret, setPret] = useState(0);
    const [categorie, setCategorie] = useState('Informatica'); 
    const [fisier, setFisier] = useState(null);
    const navigate = useNavigate();

    const handleUpload = async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;

        const formData = new FormData();
        formData.append('titlu', titlu);
        formData.append('descriere', descriere);
        formData.append('pret', pret);
        formData.append('categorie', categorie); 
        formData.append('userId', user.id);
        formData.append('fisier', fisier);

        try {
            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData
            });
            if (response.ok) navigate('/marketplace');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div className="card">
                <h2>Încarcă Material</h2>
                <form onSubmit={handleUpload}>
                    <input type="text" placeholder="Titlu" onChange={e => setTitlu(e.target.value)} required />
                    
                    <select value={categorie} onChange={e => setCategorie(e.target.value)} style={{ width: '100%', padding: '10px', margin: '8px 0', border: '1px solid #ccc', borderRadius: '4px' }}>
                        <option value="Informatica">Informatică</option>
                        <option value="Matematica">Matematică</option>
                        <option value="Economie">Economie</option>
                        <option value="Fizica">Fizică</option>
                        <option value="Altele">Altele</option>
                    </select>

                    <textarea placeholder="Descriere" onChange={e => setDescriere(e.target.value)} rows="4" />
                    <label>Preț (Puncte):</label>
                    <input type="number" value={pret} onChange={e => setPret(e.target.value)} />
                    <input type="file" onChange={e => setFisier(e.target.files[0])} required style={{ border: 'none', padding: '10px 0' }} />
                    <button type="submit">Publică</button>
                </form>
            </div>
        </div>
    );
}

export default Upload;