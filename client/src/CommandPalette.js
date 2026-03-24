import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('user'));

    const commands = [
        { id: 'home', title: 'Acasă', category: 'Navigare', icon: '🏠', path: '/' },
        { id: 'market', title: 'Marketplace Cursuri', category: 'Educație', icon: '🛒', path: '/marketplace' },
        { id: 'ai', title: 'AI Tutor (Învață cu Llama3)', category: 'Educație', icon: '🧠', path: '/learn' },
        { id: 'sessions', title: 'Meditații & Sesiuni Live', category: 'Educație', icon: '📹', path: '/sessions' },
        { id: 'top', title: 'Clasament Studenți', category: 'Comunitate', icon: '🏆', path: '/leaderboard' },
    ];

    if (user) {
        commands.push({ id: 'profile', title: 'Profilul meu & Portofel', category: 'Cont', icon: '👤', path: '/profile' });
        commands.push({ id: 'upload', title: 'Încarcă și vinde un material', category: 'Cont', icon: '📤', path: '/upload' });
        if (user.role === 'admin') {
            commands.push({ id: 'admin', title: 'Panou Administrator', category: 'Sistem', icon: '🛡️', path: '/admin' });
        }
    } else {
        commands.push({ id: 'login', title: 'Loghează-te', category: 'Cont', icon: '🔑', path: '/login' });
        commands.push({ id: 'register', title: 'Creează cont nou', category: 'Cont', icon: '🚀', path: '/register' });
    }

    const filteredCommands = commands.filter(cmd => 
        cmd.title.toLowerCase().includes(search.toLowerCase()) || 
        cmd.category.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
                setSearch('');
                setSelectedIndex(0);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        const handleOpenEvent = () => {
            setIsOpen(true);
            setSearch('');
            setSelectedIndex(0);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('openCommandPalette', handleOpenEvent); 
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('openCommandPalette', handleOpenEvent);
        };
    }, [isOpen]);

    const handleSelect = (path) => {
        setIsOpen(false);
        setSearch('');
        navigate(path);
    };

    const handleInputKeyDown = (e) => {
        if (filteredCommands.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            handleSelect(filteredCommands[selectedIndex].path);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setIsOpen(false)}
                    style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh' }}
                >
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        onClick={e => e.stopPropagation()}
                        style={{ width: '90%', maxWidth: '600px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', border: '1px solid #e2e8f0' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
                            <span style={{ fontSize: '20px', color: '#94a3b8', marginRight: '15px' }}>🔍</span>
                            <input 
                                ref={inputRef}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleInputKeyDown}
                                placeholder="Ce cauți? (ex: AI, cursuri, profil...)"
                                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '18px', color: '#1e293b', background: 'transparent' }}
                            />
                            <span style={{ fontSize: '12px', background: '#f1f5f9', color: '#64748b', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>ESC</span>
                        </div>

                        <div style={{ maxHeight: '350px', overflowY: 'auto', padding: '10px' }}>
                            {filteredCommands.length === 0 ? (
                                <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Nu am găsit nicio comandă.</div>
                            ) : (
                                filteredCommands.map((cmd, index) => {
                                    const isSelected = index === selectedIndex;
                                    return (
                                        <div 
                                            key={cmd.id} 
                                            onClick={() => handleSelect(cmd.path)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                padding: '15px', 
                                                margin: '5px 0', 
                                                borderRadius: '10px', 
                                                cursor: 'pointer', 
                                                transition: 'background 0.1s',
                                                background: isSelected ? '#f8fafc' : 'transparent',
                                                borderLeft: isSelected ? '3px solid #3498db' : '3px solid transparent'
                                            }}
                                        >
                                            <span style={{ fontSize: '20px', marginRight: '15px' }}>{cmd.icon}</span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '15px', color: isSelected ? '#3498db' : '#1e293b', fontWeight: '600' }}>{cmd.title}</div>
                                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{cmd.category}</div>
                                            </div>
                                            {isSelected && <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>Apasă Enter ↵</span>}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                        
                        <div style={{ padding: '10px 20px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
                            <span>Mentorium Command Center</span>
                            <span>Navighează cu ↑ ↓ și apasă Enter</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default CommandPalette;