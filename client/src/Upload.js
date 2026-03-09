import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

function Upload() {
    const [formData, setFormData] = useState({
        titlu: '',
        descriere: '',
        pret: 0,
        categorie: 'Altele'
    });
    const [file, setFile] = useState(null);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return toast.warning("Te rog să încarci un fișier!");
        if (!user) return toast.error("Trebuie să fii logat!");

        const data = new FormData();
        data.append('titlu', formData.titlu);
        data.append('descriere', formData.descriere);
        data.append('pret', formData.pret);
        data.append('categorie', formData.categorie);
        data.append('userId', user.id);
        data.append('fisier', file);

        try {
            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: data
            });

            if (response.ok) {
                toast.success("Material încărcat cu succes!");
                navigate('/marketplace');
            } else {
                toast.error("Eroare la încărcare. Doar PDF, JPG, PNG sunt permise.");
            }
        } catch (err) {
            toast.error("Eroare de conexiune.");
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ maxWidth: '500px', margin: '50px auto' }}>
            <div className="card">
                <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>Încărcare Material</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input 
                        type="text" 
                        placeholder="Titlu material" 
                        onChange={e => setFormData({...formData, titlu: e.target.value})} 
                        required 
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                    
                    <textarea 
                        placeholder="Descriere scurtă..." 
                        onChange={e => setFormData({...formData, descriere: e.target.value})} 
                        required 
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', minHeight: '80px' }}
                    />

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            type="number" 
                            placeholder="Preț (puncte)" 
                            onChange={e => setFormData({...formData, pret: e.target.value})} 
                            required 
                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                        />
                        
                        <select 
                            onChange={e => setFormData({...formData, categorie: e.target.value})} 
                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                        >
                            <option value="Altele">Altele</option>
                            <option value="Informatica">Informatică</option>
                            <option value="Matematica">Matematică</option>
                            <option value="Economie">Economie</option>
                            <option value="Fizica">Fizică</option>
                        </select>
                    </div>

                    <input 
                        type="file" 
                        accept=".pdf, .jpg, .jpeg, .png" 
                        onChange={e => setFile(e.target.files[0])} 
                        required 
                        style={{ padding: '10px', background: 'rgba(255,255,255,0.5)', borderRadius: '8px', border: '1px dashed #ccc' }}
                    />
                    <small style={{ color: '#7f8c8d', fontSize: '12px' }}>* Doar fișiere PDF, JPG sau PNG (max 10MB).</small>

                    <button type="submit" style={{ background: '#27ae60', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
                        Încarcă Material
                    </button>
                </form>
            </div>
        </motion.div>
    );
}

export default Upload;