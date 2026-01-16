const { Events } = require('discord.js');
const { Member } = require('../database');

const FEUR_VARIANTS = [
    'feur', 'Feur.', 'Feur ?', 'FEUR !', 'feur...', 'Feur 🌸', 'feur hehe',
];

const POUR_FEUR_VARIANTS = [
    'pour feur', 'Pour feur.', 'Pour feur ?', 'POUR FEUR !', 'pour feur...', 'Pour feur 🌺',
];

function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function detectQuoi(text) {
    const lower = text.toLowerCase();
    if (/\bpourquoi\b/.test(lower)) return 'pourquoi';
    if (/\bquoi\b/.test(lower)) return 'quoi';
    return null;
}

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        // XP system
        const xpGain = Math.floor(Math.random() * 5) + 1;

        let member = await Member.findOne({ where: { user_id: message.author.id } });

        if (member) {
            await member.update({
                nbMessages: member.nbMessages + 1,
                xp: member.xp + xpGain,
            });
        } else {
            await Member.create({
                user_id: message.author.id,
                nbMessages: 1,
                xp: xpGain,
            });
        }

        // Feur response
        const quoiType = detectQuoi(message.content);
        if (quoiType === 'pourquoi') {
            await message.reply(pickRandom(POUR_FEUR_VARIANTS));
            return;
        }
        if (quoiType === 'quoi') {
            await message.reply(pickRandom(FEUR_VARIANTS));
            return;
        }

        // Les lolos (2% chance)
        if (Math.random() < 0.02) {
            await message.channel.send('Les lolos.');
        }
    },
};
