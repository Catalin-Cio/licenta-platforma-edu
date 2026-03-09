import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

function Learn() {
    const location = useLocation();
    const resourceId = location.state?.resourceId || null;
    const titluCurs = location.state?.titlu || null;

    const [messages, setMessages] = useState([
        { 
            role: 'assistant', 
            content: titluCurs 
                ? `Salut! Am citit materialul "${titluCurs}". Sunt gata să te ajut. Vrei un rezumat sau ai întrebări specifice?` 
                : 'Salut! Sunt AI Tutor-ul tău. Îmi poți pune orice întrebare sau poți încărca un document/poză de la tine din PC apăsând pe agrafă.' 
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [customContext, setCustomContext] = useState(""); // Memoria temporară pentru ce încarci tu
    
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null); // Referința către input-ul invizibil de fișier

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Funcția care se ocupă de încărcarea fișierului pe agrafă
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setMessages(prev => [...prev, { role: 'user', content: `📎 Am încărcat: ${file.name}` }]);

        const formData = new FormData();
        formData.append('fisier', file);

        try {
            const response = await fetch('http://localhost:5000/api/ai/extract', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (response.ok) {
                setCustomContext(data.text);
                setMessages(prev => [...prev, { role: 'assistant', content: 'Am citit documentul! Acum poți să îmi puni întrebări din el.' }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: `❌ Eroare la citire: ${data.error}` }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: '❌ Eroare de conexiune la încărcarea fișierului.' }]);
        } finally {
            setLoading(false);
            e.target.value = null; // Resetăm input-ul
        }
    };

    const sendMessage = async (text) => {
        if (!text.trim()) return;

        const userMsg = { role: 'user', content: text };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resourceId: resourceId,
                    messages: newMessages,
                    customContext: customContext // Trimitem și textul din poză/PDF dacă există
                })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Eroare de la serverul AI.");
            }
            
            const textRaspuns = data.reply?.content || data.reply || "Răspuns gol.";
            setMessages([...newMessages, { role: 'assistant', content: textRaspuns }]);
            
        } catch (err) {
            console.error(err);
            setMessages([...newMessages, { role: 'assistant', content: `❌ Eroare: ${err.message}` }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ maxWidth: '800px', margin: '0 auto', height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.45)', backdropFilter: 'blur(16px)', padding: '15px 20px', borderRadius: '16px 16px 0 0', borderBottom: '1px solid rgba(255,255,255,0.6)' }}>
                <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '1.4rem' }}>AI Tutor {titluCurs && <span style={{ fontSize: '1rem', color: '#8e44ad', fontWeight: 'normal' }}>- {titluCurs}</span>}</h2>
            </div>

            <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.2)', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {messages.map((msg, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                        <div style={{ background: msg.role === 'user' ? '#2980b9' : 'rgba(255,255,255,0.8)', color: msg.role === 'user' ? 'white' : '#2c3e50', padding: '10px 16px', borderRadius: msg.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', lineHeight: '1.4', fontSize: '15px' }}>
                            {msg.content}
                        </div>
                    </motion.div>
                ))}
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.8)', padding: '10px 16px', borderRadius: '16px 16px 16px 0', color: '#7f8c8d', fontSize: '14px' }}>
                        Generează răspunsul...
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.45)', backdropFilter: 'blur(16px)', padding: '12px 20px', borderRadius: '0 0 16px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                    <button onClick={() => sendMessage("Fă-mi un rezumat scurt.")} style={{ padding: '5px 12px', borderRadius: '15px', border: '1px solid #8e44ad', background: 'transparent', color: '#8e44ad', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 'bold', fontSize: '13px' }}>Rezumat</button>
                    <button onClick={() => sendMessage("Generează 5 întrebări grilă din acest material.")} style={{ padding: '5px 12px', borderRadius: '15px', border: '1px solid #e67e22', background: 'transparent', color: '#d35400', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 'bold', fontSize: '13px' }}>Generează Grile</button>
                    <button onClick={() => sendMessage("Explică-mi conceptele principale ca unui copil de 10 ani.")} style={{ padding: '5px 12px', borderRadius: '15px', border: '1px solid #27ae60', background: 'transparent', color: '#27ae60', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 'bold', fontSize: '13px' }}>Explică simplu</button>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {/* Inputul invizibil și Butonul Agrafă */}
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf, .jpg, .jpeg, .png" style={{ display: 'none' }} />
                    <button onClick={() => fileInputRef.current.click()} title="Atașează un fișier" style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid #ccc', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', flexShrink: 0 }}>
                        📎
                    </button>

                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)} placeholder="Scrie un mesaj..." style={{ flex: 1, padding: '12px 15px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none', background: 'rgba(255,255,255,0.9)', fontSize: '14px' }} />
                    <button onClick={() => sendMessage(input)} disabled={loading} style={{ padding: '0 20px', height: '42px', borderRadius: '10px', border: 'none', background: '#2980b9', color: 'white', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Trimite</button>
                </div>
            </div>
        </motion.div>
    );
}

export default Learn;