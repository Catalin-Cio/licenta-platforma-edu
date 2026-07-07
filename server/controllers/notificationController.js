const { Notification } = require('../models');

const getNotifications = async (req, res) => {
    try {
        const notifs = await Notification.findAll({
            where: { userId: req.params.userId },
            order: [['createdAt', 'DESC']]
        });
        res.json(notifs);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const markAsRead = async (req, res) => {
    try {
        const notif = await Notification.findByPk(req.params.id);
        if (notif) {
            notif.citit = true;
            await notif.save();
            res.json({ message: "Notificare marcată ca citită" });
        } else {
            res.status(404).json({ message: "Notificarea nu există" });
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getNotifications, markAsRead };