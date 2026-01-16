const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mariadb',
        logging: false,
    }
);

const Settings = require('./models/Settings')(sequelize, Sequelize.DataTypes);
const Member = require('./models/Member')(sequelize, Sequelize.DataTypes);

module.exports = { sequelize, Settings, Member };
