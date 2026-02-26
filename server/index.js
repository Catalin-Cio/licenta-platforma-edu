const express = require('express');
const cors = require('cors');
const sequelize = require('./database');
const User = require('./models/User');
const multer = require('multer');
const path = require('path');
const Resource = require('./models/Resource');
const Purchase = require('./models/Purchase');

const app = express();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

app.use('/uploads', express.static('uploads'));
app.use(cors());
app.use(express.json());

const PORT = 5000;

app.post('/api/register', async (req, res) => {
  try {
    const { nume, email, parola } = req.body;
    
    const newUser = await User.create({
      nume,
      email,
      parola 
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la server" });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, parola } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu există!" });
    }

    if (user.parola !== parola) {
      return res.status(401).json({ message: "Parolă incorectă!" });
    }

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

app.post('/api/upload', upload.single('fisier'), async (req, res) => {
    try {
        const { titlu, descriere, pret, userId,categorie } = req.body;
        const numeFisier = req.file.filename; 

        const newResource = await Resource.create({
            titlu,
            descriere,
            pret,
            userId,
            numeFisier,
            categorie
        });

        res.status(201).json({ message: "Material încărcat!", resource: newResource });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Eroare la upload" });
    }
});

app.get('/api/resources', async (req, res) => {
    try {
        const resources = await Resource.findAll();
        res.json(resources);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Eroare la preluarea resurselor" });
    }
});

app.post('/api/buy', async (req, res) => {
    try {
        const { buyerId, resourceId } = req.body;

        const buyer = await User.findByPk(buyerId);
        const resource = await Resource.findByPk(resourceId);
        const seller = await User.findByPk(resource.userId);

        if (!buyer || !resource) return res.status(404).json({ message: "Eroare date" });
        const alreadyBought = await Purchase.findOne({
            where: { userId: buyerId, resourceId: resourceId }
        });
        if (alreadyBought) {
            return res.status(400).json({ message: "Ai cumpărat deja acest curs!" });
        }

        if (buyer.wallet < resource.pret) {
            return res.status(400).json({ message: "Fonduri insuficiente!" });
        }
        if (buyer.id === seller.id) {
            return res.status(400).json({ message: "Nu poți cumpăra propriul material!" });
        }

        buyer.wallet -= resource.pret;
        seller.wallet += resource.pret;
        await buyer.save();
        await seller.save();
        await Purchase.create({ userId: buyerId, resourceId: resourceId });

        res.json({ message: "Tranzacție reușită!", newBalance: buyer.wallet });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Eroare la tranzacție" });
    }
});

app.get('/api/purchases/:userId', async (req, res) => {
    try {
        const purchases = await Purchase.findAll({ 
            where: { userId: req.params.userId } 
        });
        const resourceIds = purchases.map(p => p.resourceId);
        res.json(resourceIds);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Eroare server" });
    }
});

app.get('/api/my-resources/:userId', async (req, res) => {
    try {
        const myResources = await Resource.findAll({ 
            where: { userId: req.params.userId } 
        });
        res.json(myResources);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Eroare server" });
    }
});

app.delete('/api/resources/:id', async (req, res) => {
    try {
        const resourceId = req.params.id;
        
        const resource = await Resource.findByPk(resourceId);
        
        if (!resource) {
            return res.status(404).json({ message: "Material inexistent" });
        }

        await resource.destroy();

        res.json({ message: "Material șters cu succes!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Eroare la ștergere" });
    }
});

app.get('/api/admin/make-me-admin/:email', async (req, res) => {
    try {
        const user = await User.findOne({ where: { email: req.params.email } });
        if (!user) return res.status(404).json({ message: "User not found" });
        
        user.role = 'admin';
        await user.save();
        res.json({ message: `Succes! ${user.email} este acum ADMIN.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await User.destroy({ where: { id: req.params.id } });
        res.json({ message: "User șters!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

sequelize.sync({ force: false })
    .then(() => {
        console.log("Baza de date PostgreSQL este conectată!");
        app.listen(PORT, () => {
            console.log(`🚀 Serverul a pornit pe portul ${PORT}`);
        });
    })
    .catch(err => {
        console.error("Eroare la conectare:", err);
    });