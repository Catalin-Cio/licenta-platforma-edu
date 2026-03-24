import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

function Learn() {
    const location = useLocation();
    const resourceId = location.state?.resourceId || null;
    const titluCurs = location.state?.titlu || null;

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [customContext, setCustomContext] = useState(""); 
    
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const abortControllerRef = useRef(null); // Ref pentru a putea opri AI-ul

    const user = JSON.parse(localStorage.getItem('user'));
    const avatarUrl = user?.avatar && user.avatar !== 'default.png' 
        ? `http://localhost:5000/uploads/${user.avatar}` 
        : `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.nume || 'User'}`;

    // Mesajul de bun venit
    useEffect(() => {
        setMessages([
            { 
                role: 'assistant', 
                content: titluCurs 
                    ? `Salut! Am citit materialul "${titluCurs}". Sunt gata să te ajut. Vrei un rezumat sau ai întrebări specifice?` 
                    : 'Salut! Sunt AI Tutor-ul tău. Îmi poți pune orice întrebare sau poți încărca un document/poză apăsând pe agrafă.' 
            }
        ]);
    }, [titluCurs]);

    // Auto-scroll la ultimul mesaj
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setMessages(prev => [...prev, { role: 'user', content: `📎 Am atașat fișierul: ${file.name}` }]);

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
                setMessages(prev => [...prev, { role: 'assistant', content: 'Am analizat documentul. Ce ai dori să afli din el?' }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: `❌ Eroare: ${data.error}` }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: '❌ Eroare de conexiune la server.' }]);
        } finally {
            setLoading(false);
            e.target.value = null; 
        }
    };

    // Funcția care oprește generarea AI-ului
    const stopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort(); // Trimitem semnalul de anulare
        }
        setLoading(false);
    };

    const sendMessage = async (text) => {
        if (!text.trim() || loading) return;

        const newMessages = [...messages, { role: 'user', content: text }];
        setMessages([...newMessages, { role: 'assistant', content: '' }]);
        setInput('');
        setLoading(true);

        // Creăm un nou controler pentru a putea anula cererea
        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch('http://localhost:5000/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: abortControllerRef.current.signal, // Atașăm semnalul la cerere
                body: JSON.stringify({
                    resourceId: resourceId,
                    messages: newMessages,
                    customContext: customContext
                })
            });

            if (!response.ok) throw new Error("Eroare de la server.");

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let done = false;
            let currentResponse = '';
            let buffer = '';

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop(); // Păstrăm ultima bucată incompletă în buffer
                    
                    for (const line of lines) {
                        if (line.trim() === '') continue;
                        try {
                            const parsed = JSON.parse(line);
                            if (parsed.message?.content) {
                                currentResponse += parsed.message.content;
                                setMessages(prev => {
                                    const updated = [...prev];
                                    updated[updated.length - 1].content = currentResponse;
                                    return updated;
                                });
                            }
                        } catch (e) {
                            // Ignorăm erorile de parsare JSON pentru fragmente incomplete
                        }
                    }
                }
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                // Dacă utilizatorul a apăsat STOP, nu arătăm eroare
                console.log("Generare oprită de utilizator.");
            } else {
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1].content = "❌ A apărut o problemă la generare.";
                    return updated;
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', background: '#ffffff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', position: 'relative' }}>
            
            {/* HEADER-UL CHAT-ULUI */}
            <div style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', padding: '15px 25px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '15px', zIndex: 10 }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #3498db, #9b59b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '16px' }}>M</div>
                <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem', fontWeight: '700' }}>Mentorium AI {titluCurs && <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500', marginLeft: '5px' }}>• {titluCurs}</span>}</h2>
            </div>

            {/* ZONA DE MESAJE */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0 120px 0', scrollBehavior: 'smooth', position: 'relative' }}>
                {messages.length === 0 && (
                    <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', opacity: 0.5 }}>
                        <div style={{ fontSize: '50px', background: 'linear-gradient(135deg, #3498db, #9b59b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>M</div>
                        <p style={{ fontWeight: '600', color: '#64748b', marginTop: '10px' }}>Cum te pot ajuta astăzi?</p>
                    </div>
                )}

                {messages.map((msg, idx) => {
                    const isUser = msg.role === 'user';
                    return (
                        <motion.div 
                            key={idx} 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '15px 25px', display: 'flex', gap: '20px' }}
                        >
                            <div style={{ flexShrink: 0 }}>
                                {isUser ? (
                                    <img src={avatarUrl} alt="User" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', background: '#f1f5f9', border: '1px solid #e2e8f0' }} />
                                ) : (
                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>M</div>
                                )}
                            </div>
                            
                            <div style={{ flex: 1, paddingTop: '3px' }}>
                                <div style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '5px', fontSize: '14px' }}>
                                    {isUser ? user?.nume || 'Tu' : 'Mentorium AI'}
                                </div>
                                <div style={{ 
                                    color: '#334155', 
                                    fontSize: '15px', 
                                    lineHeight: '1.7', 
                                    whiteSpace: 'pre-wrap',
                                    background: isUser ? '#f8fafc' : 'transparent',
                                    padding: isUser ? '10px 15px' : '0',
                                    borderRadius: isUser ? '12px' : '0',
                                    border: isUser ? '1px solid #f1f5f9' : 'none',
                                    display: 'inline-block',
                                    maxWidth: '100%'
                                }}>
                                    {msg.content || (loading && idx === messages.length - 1 ? <span style={{ opacity: 0.5 }}>Gândește...</span> : '')}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT-UL PLUTITOR (Floating Prompt 2026 Style) */}
            <div style={{ position: 'absolute', bottom: '20px', left: '0', width: '100%', padding: '0 20px', pointerEvents: 'none' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', pointerEvents: 'auto' }}>
                    
                    {/* Butoanele de sugestii (Apar doar la început) */}
                    {messages.length <= 2 && !loading && (
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
                            <button onClick={() => sendMessage("Fă-mi un rezumat scurt al materialului.")} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>📝 Rezumă materialul</button>
                            <button onClick={() => sendMessage("Generează 5 întrebări grilă din acest material.")} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>🎯 Generează Grile</button>
                            <button onClick={() => sendMessage("Explică-mi conceptele principale foarte simplu.")} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>💡 Explică simplu</button>
                        </div>
                    )}

                    {/* Bara de input */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(15px)', borderRadius: '30px', padding: '8px 10px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf, .jpg, .jpeg, .png" style={{ display: 'none' }} />
                        <button 
                            onClick={() => fileInputRef.current.click()} 
                            disabled={loading}
                            style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: loading ? 'not-allowed' : 'pointer', color: '#64748b', fontSize: '18px', transition: 'all 0.2s' }}
                            title="Atașează PDF/Imagine"
                        >
                            +
                        </button>
                        
                        <input 
                            type="text" 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage(input)} 
                            placeholder="Mesaj Mentorium AI..." 
                            disabled={loading}
                            style={{ flex: 1, padding: '10px 15px', background: 'transparent', border: 'none', outline: 'none', fontSize: '15px', color: '#1e293b' }} 
                        />
                        
                        {/* AICI E MAGIA: BUTON DINAMIC SEND / STOP */}
                        {loading ? (
                            <button 
                                onClick={stopGeneration} 
                                title="Oprește generarea"
                                style={{ background: '#0f172a', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}
                            >
                                {/* Pătrat de Stop (SVG pt claritate maximă) */}
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
                            </button>
                        ) : (
                            <button 
                                onClick={() => sendMessage(input)} 
                                disabled={!input.trim()} 
                                title="Trimite mesajul"
                                style={{ background: input.trim() ? '#0f172a' : '#e2e8f0', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
                            >
                                {/* Săgeată de Send */}
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                            </button>
                        )}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
                        AI-ul poate genera informații inexacte. Te rugăm să verifici faptele importante.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Learn;