const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nume: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    parola: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'student'
    },
    // SISTEMUL DE GAMIFICATION
    wallet: {
        type: DataTypes.INTEGER,
        defaultValue: 50, // Primește 50 credite la start
        validate: {
            min: 0 // Nu poate avea puncte negative
        }
    }
});

module.exports = User;