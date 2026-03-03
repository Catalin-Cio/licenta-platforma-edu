const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Session = sequelize.define('Session', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    titlu: { type: DataTypes.STRING, allowNull: false },
    materie: { type: DataTypes.STRING, allowNull: false },
    descriere: { type: DataTypes.TEXT },
    dataOra: { type: DataTypes.STRING, allowNull: false },
    pret: { type: DataTypes.INTEGER, defaultValue: 20 },
    linkMeet: { type: DataTypes.STRING, allowNull: false },
    hostId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = Session;