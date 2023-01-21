const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.SQLITE_DATABASE, process.env.SQLITE_USER, process.env.SQLITE_PASSWORD, {
    host: process.env.SQLITE_HOST,
    dialect: 'mariadb',
    logging: false,
});

const Settings = require('./models/Settings')(sequelize, Sequelize.DataTypes);

module.exports = { Settings };
