const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Enrollment = sequelize.define('Enrollment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    studentId: { type: DataTypes.INTEGER, allowNull: false },
    sessionId: { type: DataTypes.INTEGER, allowNull: false },
    pricePaid: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = Enrollment;