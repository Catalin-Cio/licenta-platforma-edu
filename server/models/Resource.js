const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Resource = sequelize.define('Resource', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titlu: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descriere: {
        type: DataTypes.TEXT
    },
    numeFisier: { 
        type: DataTypes.STRING,
        allowNull: false
    },
    pret: {
        type: DataTypes.INTEGER,
        defaultValue: 0 
    },
    userId: { 
        type: DataTypes.INTEGER,
        allowNull: false
    },
    categorie: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        defaultValue: 'Altele' 
    }
});

module.exports = Resource;