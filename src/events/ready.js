const { Events, ActivityType } = require('discord.js');

const STATUSES = [
    'Pourquoi ? Pour feur.',
    'Je vous observe.',
    '1 message sur 50...',
    'Moi je m\'appelle 10-bit',
    'quoi',
    'Verge.',
    '10 bits ça fait beaucoup',
    'beep boop',
];

function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function rotateStatus(client) {
    const status = pickRandom(STATUSES);
    client.user.setActivity(status, { type: ActivityType.Custom });
}

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        rotateStatus(client);
        setInterval(() => rotateStatus(client), 5 * 60 * 1000); // toutes les 5 min
    },
};
