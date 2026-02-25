const express = require('express');
const cors = require('cors');
const sequelize = require('./database');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// Această funcție conectează baza de date și ține serverul deschis
sequelize.sync({ force: false })
    .then(() => {
        console.log("✅ Baza de date PostgreSQL este conectată!");
        
        // AICI e secretul: app.listen ține serverul pornit
        app.listen(PORT, () => {
            console.log(`🚀 Serverul a pornit pe portul ${PORT}`);
        });
    })
    .catch(err => {
        console.error("❌ Eroare la conectare:", err);
    });