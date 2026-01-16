const { sequelize } = require('./database');

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
    console.log('Database synced' + (force ? ' (force)' : ''));
    sequelize.close();
}).catch(console.error);
