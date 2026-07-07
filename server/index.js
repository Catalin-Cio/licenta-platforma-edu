require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./database');
const { User, Resource, Purchase, Session, Enrollment, Notification } = require('./models');

const authRoutes = require('./routes/authRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();


app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api', authRoutes);
app.use('/api', resourceRoutes);
app.use('/api', sessionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', userRoutes);
app.use('/api', notificationRoutes);

const PORT = process.env.PORT || 5000;

// Sincronizăm baza de date și pornim serverul
sequelize.sync({ force: false }) 
    .then(() => {
        console.log("Baza de date conectată cu succes!");
        app.listen(PORT, () => {
            console.log(`Serverul Mentorium rulează pe portul ${PORT}`);
        });
    })
    .catch(err => console.error(" Eroare la conectarea bazei de date:", err));