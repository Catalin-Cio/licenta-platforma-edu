const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false }, 
    mesaj: { type: DataTypes.STRING, allowNull: false },
    citit: { type: DataTypes.BOOLEAN, defaultValue: false },
    tip: { type: DataTypes.STRING } 
});

module.exports = Notification;