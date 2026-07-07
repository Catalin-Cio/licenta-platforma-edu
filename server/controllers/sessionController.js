const { Session, User, Enrollment, Notification } = require('../models');
const { Op } = require('sequelize'); 

const createSession = async (req, res) => {
    try {
        const { titlu, materie, descriere, dataOra, pret, linkMeet, hostId } = req.body;
        const session = await Session.create({
            titlu, materie, descriere, dataOra, pret, linkMeet, hostId
        });
        res.status(201).json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.findAll();
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const joinSession = async (req, res) => {
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
};

const cancelSession = async (req, res) => {
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
};

const getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.findAll({ where: { studentId: req.params.userId } });
        res.json(enrollments.map(e => e.sessionId));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getSessionParticipants = async (req, res) => {
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
};

module.exports = {
    createSession,
    getAllSessions,
    joinSession,
    cancelSession,
    getMyEnrollments,
    getSessionParticipants
};