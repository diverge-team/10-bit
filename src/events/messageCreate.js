const { Events, EmbedBuilder } = require('discord.js');
const { Member } = require('../database');

const FEUR_VARIANTS = [
    'feur', 'Feur.', 'Feur ?', 'FEUR !', 'feur...', 'Feur 🌸', 'feur hehe',
];

const POUR_FEUR_VARIANTS = [
    'pour feur', 'Pour feur.', 'Pour feur ?', 'POUR FEUR !', 'pour feur...', 'Pour feur 🌺',
];

const NATA_GIFS = [
    'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDA2OHRhOXQzY2ppMTNpZnk2dXN4NXdkNjZzaWlvbnBhbTV2YnNwdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zUml4ECfPmpv2Rvw8C/giphy.gif',
    'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWNseHI2dmptNXVvcmRoaWFzNTd0eDd6cHR4b2RoMXhudm83ajY1ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/91BKhwDl3bYyOfEviA/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bWZ3b3dhMzR6am44bHNhY3JhbXdqb2t4ODN4bnkxbGdtc2R1YWV4ayZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/85IehmL7hzfdi5t38v/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bWZ3b3dhMzR6am44bHNhY3JhbXdqb2t4ODN4bnkxbGdtc2R1YWV4ayZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/C7NPVfbAMdbYs1cTZi/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3b3IxZDdkbTJibGVldW9pMGFuaHU2bzN2bmVkc2RnMHJyczBvYTJwcCZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/mAbQSUCdXldtQp1n19/giphy.gif',
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

        // Alyxal response (5% chance)
        if (message.author.id === process.env.ALYXAL_USER_ID && Math.random() < 0.2) {
            const gif = pickRandom(NATA_GIFS);
            const embed = new EmbedBuilder()
                .setDescription('Tu as toujours l\'air occupée, Chasseuse...')
                .setImage(gif)
                .setColor(0x5865F2);
            await message.reply({ embeds: [embed] });
        }
    },
};
