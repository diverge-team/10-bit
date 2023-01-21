const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mariadb',
    logging: false,
});

require('./models/Settings')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
    /*const shop = [
        CurrencyShop.upsert({ name: 'Tea', cost: 1 }),
        CurrencyShop.upsert({ name: 'Coffee', cost: 2 }),
        CurrencyShop.upsert({ name: 'Cake', cost: 5 }),
    ];

    await Promise.all(shop);*/
    console.log('Database synced');

    sequelize.close();
}).catch(console.error);
