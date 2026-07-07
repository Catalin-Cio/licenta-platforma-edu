const { User, Resource, Purchase, Session, Enrollment } = require('../models');
const { Op } = require('sequelize');

const uploadAvatar = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        
        user.avatar = req.file.filename;
        await user.save();
        res.json({ message: "Poză de profil actualizată!", avatar: user.avatar });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const makeAdmin = async (req, res) => {
    try {
        const user = await User.findOne({ where: { email: req.params.email } });
        if (!user) return res.status(404).json({ message: "User not found" });
        user.role = 'admin';
        await user.save();
        res.json({ message: `Succes! ${user.email} este acum ADMIN.` });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 4. Ștergere Utilizator (Pentru Admin Panel)
const deleteUser = async (req, res) => {
    try {
        await User.destroy({ where: { id: req.params.id } });
        res.json({ message: "User șters!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getLeaderboard = async (req, res) => {
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
};

const getMyActivity = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        
        const purchases = await Purchase.findAll({ where: { userId } });
        const expensesFiles = [];
        for (let p of purchases) {
            const resItem = await Resource.findByPk(p.resourceId);
            if (resItem) {
                expensesFiles.push({
                    type: 'file_bought', titlu: resItem.titlu, pret: resItem.pret,
                    data: p.createdAt, direction: 'out'
                });
            }
        }

        const enrollments = await Enrollment.findAll({ where: { studentId: userId } });
        const expensesSessions = [];
        for (let e of enrollments) {
            const sess = await Session.findByPk(e.sessionId);
            if (sess) {
                expensesSessions.push({
                    type: 'session_joined', titlu: sess.titlu, pret: e.pricePaid,
                    data: e.createdAt, direction: 'out'
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
                    type: 'file_sold', titlu: soldRes.titlu, pret: soldRes.pret,
                    data: s.createdAt, direction: 'in' 
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
                    type: 'session_hosted', titlu: sessionInfo.titlu, pret: h.pricePaid,
                    data: h.createdAt, direction: 'in'
                });
            }
        }

        const fullActivity = [
            ...expensesFiles, ...expensesSessions, ...incomeFiles, ...incomeSessions
        ].sort((a, b) => new Date(b.data) - new Date(a.data));

        res.json(fullActivity);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { uploadAvatar, makeAdmin, getAllUsers, deleteUser, getLeaderboard, getMyActivity };