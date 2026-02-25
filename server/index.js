const express = require('express');
const cors = require('cors');
const sequelize = require('./database');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// Ruta pentru a crea un student nou
app.post('/api/register', async (req, res) => {
  try {
    const { nume, email, parola } = req.body;
    
    // Creăm utilizatorul în baza de date (cu 50 puncte bonus automat din model)
    const newUser = await User.create({
      nume,
      email,
      parola // Notă: În producție parola se criptează, dar pt demo e ok așa
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la server" });
  }
});

// Ruta de Autentificare (Login)
app.post('/api/login', async (req, res) => {
  try {
    const { email, parola } = req.body;

    // 1. Căutăm utilizatorul după email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu există!" });
    }

    // 2. Verificăm parola (simplă pentru demo)
    if (user.parola !== parola) {
      return res.status(401).json({ message: "Parolă incorectă!" });
    }

    // 3. Trimitem datele înapoi (fără parolă)
    res.json({
      message: "Login reușit!",
      user: {
        id: user.id,
        nume: user.nume,
        email: user.email,
        wallet: user.wallet,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare server" });
  }
});

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