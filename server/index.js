const express = require('express');
const cors = require('cors');
const sequelize = require('./database');
const { Op } = require('sequelize');
const User = require('./models/User');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const PDFParser = require("pdf2json");
const Resource = require('./models/Resource');
const Purchase = require('./models/Purchase');
const Session = require('./models/Session');
const Enrollment = require('./models/Enrollment');
const Notification = require('./models/Notification'); 
const bcrypt = require('bcrypt'); // <--- AICI AM IMPORTAT PACHETUL DE HASH

const app = express();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); 
    } else {
        cb(new Error('Tip de fișier neacceptat. Doar PDF, JPG și PNG sunt permise.'), false); 
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } 
});

app.use('/uploads', express.static('uploads'));
app.use(cors());
app.use(express.json());

const PORT = 5000;

app.post('/api/register', async (req, res) => {
  try {
    const { nume, email, parola } = req.body;
    
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(parola)) {
        return res.status(400).json({ message: "Parola este prea slabă. Trebuie să aibă minim 8 caractere, o literă mare și o cifră." });
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Emailul este deja folosit!" });

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(parola, saltRounds);
    const newUser = await User.create({ nume, email, parola: hashedPassword });
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
    
    if (!user) return res.status(404).json({ message: "Utilizatorul nu există!" });
    
    const match = await bcrypt.compare(parola, user.parola);
    if (!match) return res.status(401).json({ message: "Parolă incorectă!" });
    
    res.json({
      message: "Login reușit!",
      user: {
        id: user.id,
        nume: user.nume,
        email: user.email,
        wallet: user.wallet,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare server" });
  }
});

app.post('/api/user/:id/avatar', upload.single('avatar'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        
        user.avatar = req.file.filename;
        await user.save();
        
        res.json({ message: "Poză de profil actualizată!", avatar: user.avatar });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/make-me-admin/:email', async (req, res) => {
    try {
        const user = await User.findOne({ where: { email: req.params.email } });
        if (!user) return res.status(404).json({ message: "User not found" });
        user.role = 'admin';
        await user.save();
        res.json({ message: `Succes! ${user.email} este acum ADMIN.` });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await User.destroy({ where: { id: req.params.id } });
        res.json({ message: "User șters!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/upload', upload.single('fisier'), async (req, res) => {
    try {
        const { titlu, descriere, pret, userId, categorie } = req.body;
        const numeFisier = req.file.filename;
        const newResource = await Resource.create({
            titlu, descriere, pret, userId, numeFisier, categorie
        });
        res.status(201).json({ message: "Material încărcat!", resource: newResource });
    } catch (error) {
        res.status(500).json({ message: "Eroare la upload" });
    }
});

app.get('/api/resources', async (req, res) => {
    try {
        const resources = await Resource.findAll();
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: "Eroare la preluarea resurselor" });
    }
});

app.get('/api/my-resources/:userId', async (req, res) => {
    try {
        const myResources = await Resource.findAll({ where: { userId: req.params.userId } });
        res.json(myResources);
    } catch (error) {
        res.status(500).json({ message: "Eroare server" });
    }
});

app.delete('/api/resources/:id', async (req, res) => {
    try {
        const resource = await Resource.findByPk(req.params.id);
        if (!resource) return res.status(404).json({ message: "Material inexistent" });
        await resource.destroy();
        res.json({ message: "Material șters cu succes!" });
    } catch (error) {
        res.status(500).json({ message: "Eroare la ștergere" });
    }
});

app.post('/api/buy', async (req, res) => {
    try {
        const { buyerId, resourceId } = req.body;
        const buyer = await User.findByPk(buyerId);
        const resource = await Resource.findByPk(resourceId);
        const seller = await User.findByPk(resource.userId);

        if (!buyer || !resource) return res.status(404).json({ message: "Eroare date" });
        const alreadyBought = await Purchase.findOne({ where: { userId: buyerId, resourceId: resourceId } });
        if (alreadyBought) return res.status(400).json({ message: "Ai cumpărat deja acest curs!" });

        if (buyer.wallet < resource.pret) return res.status(400).json({ message: "Fonduri insuficiente!" });
        if (buyer.id === seller.id) return res.status(400).json({ message: "Nu poți cumpăra propriul material!" });

        buyer.wallet -= resource.pret;
        seller.wallet += resource.pret;
        await buyer.save();
        await seller.save();
        await Purchase.create({ userId: buyerId, resourceId: resourceId });
        await Notification.create({
            userId: seller.id,
            mesaj: `🎉 ${buyer.nume} a cumpărat materialul tău "${resource.titlu}". Ai primit ${resource.pret} pct!`,
            tip: 'vanzare'
        });

        res.json({ message: "Tranzacție reușită!", newBalance: buyer.wallet });
    } catch (error) {
        res.status(500).json({ message: "Eroare la tranzacție" });
    }
});

app.get('/api/purchases/:userId', async (req, res) => {
    try {
        const purchases = await Purchase.findAll({ where: { userId: req.params.userId } });
        const resourceIds = purchases.map(p => p.resourceId);
        res.json(resourceIds);
    } catch (error) {
        res.status(500).json({ message: "Eroare server" });
    }
});

app.post('/api/sessions', async (req, res) => {
    try {
        const { titlu, materie, descriere, dataOra, pret, linkMeet, hostId } = req.body;
        const session = await Session.create({
            titlu, materie, descriere, dataOra, pret, linkMeet, hostId
        });
        res.status(201).json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/sessions', async (req, res) => {
    try {
        const sessions = await Session.findAll();
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/sessions/join', async (req, res) => {
    try {
        const { studentId, sessionId } = req.body;
        const student = await User.findByPk(studentId);
        const session = await Session.findByPk(sessionId);
        const host = await User.findByPk(session.hostId);

        if (student.wallet < session.pret) return res.status(400).json({ message: "Fonduri insuficiente!" });
        if (student.id === host.id) return res.status(400).json({ message: "Nu te poți înscrie la propria sesiune!" });
        
        const existing = await Enrollment.findOne({ where: { studentId, sessionId } });
        if (existing) return res.status(400).json({ message: "Ești deja înscris!" });

        student.wallet -= session.pret;
        host.wallet += session.pret;
        
        await student.save();
        await host.save();

        await Enrollment.create({
            studentId,
            sessionId,
            pricePaid: session.pret
        });

        await Notification.create({
            userId: host.id,
            mesaj: `🎓 ${student.nume} s-a înscris la meditația ta "${session.titlu}". Ai primit ${session.pret} pct!`,
            tip: 'inscriere'
        });

        res.json({ message: "Înscriere reușită!", remainingWallet: student.wallet });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/sessions/:id', async (req, res) => {
    try {
        const sessionId = req.params.id;
        const session = await Session.findByPk(sessionId);
        if (!session) return res.status(404).json({ message: "Sesiunea nu există" });

        const host = await User.findByPk(session.hostId);
        const enrollments = await Enrollment.findAll({ where: { sessionId } });

        for (let enroll of enrollments) {
            const student = await User.findByPk(enroll.studentId);
            student.wallet += enroll.pricePaid; 
            host.wallet -= enroll.pricePaid;
            await student.save();
            await enroll.destroy();
        }
        
        await host.save();
        await session.destroy();

        res.json({ message: "Sesiune anulată! Bani returnați." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/my-enrollments/:userId', async (req, res) => {
    try {
        const enrollments = await Enrollment.findAll({ where: { studentId: req.params.userId } });
        res.json(enrollments.map(e => e.sessionId));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/sessions/:id/participants', async (req, res) => {
    try {
        const enrollments = await Enrollment.findAll({ where: { sessionId: req.params.id } });
        if (enrollments.length === 0) return res.json([]);
        const studentIds = enrollments.map(e => e.studentId);
        const students = await User.findAll({
            where: { id: { [Op.in]: studentIds } },
            attributes: ['nume', 'email']
        });
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/my-activity/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const purchases = await Purchase.findAll({ where: { userId } });
        const expensesFiles = [];
        for (let p of purchases) {
            const resItem = await Resource.findByPk(p.resourceId);
            if (resItem) {
                expensesFiles.push({
                    type: 'file_bought',
                    titlu: resItem.titlu,
                    pret: resItem.pret,
                    data: p.createdAt,
                    direction: 'out'
                });
            }
        }

        const enrollments = await Enrollment.findAll({ where: { studentId: userId } });
        const expensesSessions = [];
        for (let e of enrollments) {
            const sess = await Session.findByPk(e.sessionId);
            if (sess) {
                expensesSessions.push({
                    type: 'session_joined',
                    titlu: sess.titlu,
                    pret: e.pricePaid,
                    data: e.createdAt,
                    direction: 'out'
                });
            }
        }

        const myResources = await Resource.findAll({ where: { userId } });
        const myResourceIds = myResources.map(r => r.id);
        
        let incomeFiles = [];
        if (myResourceIds.length > 0) {
            const sales = await Purchase.findAll({ where: { resourceId: { [Op.in]: myResourceIds } } });
            for (let s of sales) {
                const soldRes = myResources.find(r => r.id === s.resourceId);
                incomeFiles.push({
                    type: 'file_sold',
                    titlu: soldRes.titlu,
                    pret: soldRes.pret,
                    data: s.createdAt,
                    direction: 'in' 
                });
            }
        }

        const mySessions = await Session.findAll({ where: { hostId: userId } });
        const mySessionIds = mySessions.map(s => s.id);

        let incomeSessions = [];
        if (mySessionIds.length > 0) {
            const hostedEnrollments = await Enrollment.findAll({ where: { sessionId: { [Op.in]: mySessionIds } } });
            for (let h of hostedEnrollments) {
                const sessionInfo = mySessions.find(s => s.id === h.sessionId);
                incomeSessions.push({
                    type: 'session_hosted',
                    titlu: sessionInfo.titlu,
                    pret: h.pricePaid,
                    data: h.createdAt,
                    direction: 'in'
                });
            }
        }

        const fullActivity = [
            ...expensesFiles, 
            ...expensesSessions, 
            ...incomeFiles, 
            ...incomeSessions
        ].sort((a, b) => new Date(b.data) - new Date(a.data));

        res.json(fullActivity);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/notifications/:userId', async (req, res) => {
    try {
        const notifs = await Notification.findAll({
            where: { userId: req.params.userId },
            order: [['createdAt', 'DESC']]
        });
        res.json(notifs);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const topUsers = await User.findAll({
            order: [['wallet', 'DESC']], 
            limit: 10, 
            attributes: ['id', 'nume', 'wallet'] 
        });
        res.json(topUsers);
    } catch (err) {
        console.error("Eroare la Top:", err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/ai/chat', async (req, res) => {
    try {
        const { resourceId, messages, customContext } = req.body;
        let contextText = customContext || "";

        if (resourceId) {
            const resource = await Resource.findByPk(resourceId);
            if (resource) {
                const filePath = path.join(__dirname, 'uploads', resource.numeFisier);
                if (fs.existsSync(filePath)) {
                    const ext = path.extname(resource.numeFisier).toLowerCase();
                    
                    if (ext === '.pdf') {
                        contextText = await new Promise((resolve, reject) => {
                            const pdfParser = new PDFParser(this, 1);
                            pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
                            pdfParser.on("pdfParser_dataReady", pdfData => {
                                resolve(pdfParser.getRawTextContent().substring(0, 3000));
                            });
                            pdfParser.loadPDF(filePath);
                        });
                    } else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
                        const { data: { text } } = await Tesseract.recognize(filePath, 'eng+ron');
                        contextText = text.substring(0, 3000);
                    }
                }
            }
        }

        const systemMessage = {
            role: "system",
            content: `Ești Mentorium AI, un profesor universitar de nota 10, prietenos și concis.
            Răspunzi mereu în LIMBA ROMÂNĂ și folosești emoji-uri ocazional.
            
            REGULĂ ABSOLUTĂ ȘI STRICTĂ: Ești un asistent EXCLUSIV EDUCAȚIONAL. Funcționezi doar în sfera academică, școlară, științifică și de dezvoltare profesională. 
            Dacă utilizatorul te întreabă absolut orice altceva (ex: rețete de mâncare, reparații auto, bârfe, sport, filme, glume care nu au legătură cu școala), TREBUIE SĂ REFUZI POLITICOS. Îi vei spune clar că rolul tău pe platforma Mentorium este doar să îl ajuți la studiu și să revină la subiecte educaționale.
            
            Dacă primești un text extras dintr-un curs/poză, folosește-l pentru a răspunde: \n""" ${contextText} """\n
            Dacă textul e gol, ajută studentul folosind cunoștințele tale academice.`
        };

        const chatHistory = [systemMessage, ...messages];

        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3',
                messages: chatHistory,
                stream: true 
            })
        });

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');

        for await (const chunk of response.body) {
            res.write(chunk);
        }
        res.end();

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Eroare la AI." });
    }
});

app.post('/api/ai/extract', upload.single('fisier'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Niciun fișier primit." });
        const filePath = req.file.path;
        const ext = path.extname(req.file.originalname).toLowerCase();
        let extractedText = "";

        if (ext === '.pdf') {
            const PDFParser = require("pdf2json");
            extractedText = await new Promise((resolve, reject) => {
                const pdfParser = new PDFParser(this, 1);
                pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
                pdfParser.on("pdfParser_dataReady", pdfData => {
                    resolve(pdfParser.getRawTextContent().substring(0, 3000));
                });
                pdfParser.loadPDF(filePath);
            });
        } else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
            const { data: { text } } = await Tesseract.recognize(filePath, 'eng+ron');
            extractedText = text.substring(0, 3000);
        }
        
        fs.unlinkSync(filePath);
        
        res.json({ text: extractedText });
    } catch (err) {
        console.error("Eroare la extragerea textului:", err);
        res.status(500).json({ error: "Eroare la procesarea fișierului." });
    }
});

app.put('/api/notifications/:id/read', async (req, res) => {
    try {
        const notif = await Notification.findByPk(req.params.id);
        if (notif) {
            notif.citit = true;
            await notif.save();
            res.json({ message: "Notificare marcată ca citită" });
        } else {
            res.status(404).json({ message: "Notificarea nu există" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

sequelize.sync({ force: false }) 
    .then(() => {
        console.log("Baza de date conectată!");
        app.listen(PORT, () => {
            console.log(`Server pornit pe portul ${PORT}`);
        });
    })
    .catch(err => console.error(err));