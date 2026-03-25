import { Link, useLocation } from 'react-router-dom';

function Footer() {
    const location = useLocation();

    // UX PREMIUM: Ascundem Footer-ul complet pe pagina de AI Tutor
    if (location.pathname === '/learn') {
        return null; 
    }

    return (
        <footer style={{
            marginTop: 'auto',
            padding: '40px 20px',
            background: '#0f172a', // Culoare solidă (fără opacitate) pentru a bloca lumina
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            color: '#94a3b8',
            textAlign: 'center',
            fontSize: '14px',
            position: 'relative', // Obligatoriu pentru z-index
            zIndex: 50 // Îl forțează să stea DEASUPRA luminii de pe fundal
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem', fontWeight: '900', color: 'white', letterSpacing: '0.5px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #3498db, #9b59b6)', borderRadius: '10px', width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                        <span style={{ fontSize: '16px', color: 'white' }}>M</span>
                    </div>
                    Mentorium
                </div>
                
                <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'center', fontWeight: '500' }}>
                    <Link to="#" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = '#cbd5e1'}>Termeni și Condiții</Link>
                    <Link to="#" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = '#cbd5e1'}>Politică de Confidențialitate</Link>
                    <a href="mailto:contact@mentorium.ro" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = '#cbd5e1'}>Suport: contact@mentorium.ro</a>
                </div>
                
                <div style={{ marginTop: '10px', fontSize: '13px', opacity: 0.6 }}>
                    &copy; {new Date().getFullYear()} Mentorium. Toate drepturile rezervate. Platformă educațională inteligentă.
                </div>
            </div>
        </footer>
    );
}

export default Footer;