const { Sequelize } = require('sequelize');

// Configurare conexiune Postgres
// 'licenta_db' = numele bazei de date (trebuie să o creezi în pgAdmin sau terminal)
// 'postgres' = userul default
// 'parola_ta' = parola pe care ai pus-o la instalarea PostgreSQL
const sequelize = new Sequelize('licenta_db', 'postgres', '1234', {
    host: 'localhost',
    dialect: 'postgres'
});

module.exports = sequelize;