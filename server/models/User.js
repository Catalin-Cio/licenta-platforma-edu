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
    wallet: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
        validate: {
            min: 0
        }
    },
    avatar: {
        type: DataTypes.STRING,
        defaultValue: 'default.png'
    }
});

module.exports = User;