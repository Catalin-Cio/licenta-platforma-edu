const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Purchase = sequelize.define('Purchase', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: { 
        type: DataTypes.INTEGER,
        allowNull: false
    },
    resourceId: { 
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Purchase;