const { Resource, User, Purchase, Notification } = require('../models');

const getAllResources = async (req, res) => {
    try {
        const resources = await Resource.findAll();
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: "Eroare la preluarea resurselor" });
    }
};

const uploadResource = async (req, res) => {
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
};

const getMyResources = async (req, res) => {
    try {
        const myResources = await Resource.findAll({ where: { userId: req.params.userId } });
        res.json(myResources);
    } catch (error) {
        res.status(500).json({ message: "Eroare server" });
    }
};

const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findByPk(req.params.id);
        if (!resource) return res.status(404).json({ message: "Material inexistent" });
        await resource.destroy();
        res.json({ message: "Material șters cu succes!" });
    } catch (error) {
        res.status(500).json({ message: "Eroare la ștergere" });
    }
};

const buyResource = async (req, res) => {
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
};

const getPurchasedResourceIds = async (req, res) => {
    try {
        const purchases = await Purchase.findAll({ where: { userId: req.params.userId } });
        const resourceIds = purchases.map(p => p.resourceId);
        res.json(resourceIds);
    } catch (error) {
        res.status(500).json({ message: "Eroare server" });
    }
};

module.exports = {
    getAllResources,
    uploadResource,
    getMyResources,
    deleteResource,
    buyResource,
    getPurchasedResourceIds
};