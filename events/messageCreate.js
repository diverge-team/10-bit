const { Events } = require('discord.js');
const { Member } = require('../dbObjects.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        await message.fetch();

        if (process.env.CLIENT_ID === message.author.id) {
            return;
        }

        let member = await Member.findOne({where: {user_id: message.author.id}});

        if (member) {
            await Member.update({nbMessages: member.nbMessages + 1, xp: member.xp + (Math.floor(Math.random() * (6 - 1) + 1))}, { where: { id: member.id}});
        } else {
            await Member.create({
                user_id: message.author.id,
                nbMessages: 1,
                xp: Math.floor(Math.random() * (6 - 1) + 1)
            })
        }
    },
};
