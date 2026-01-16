const { Events } = require('discord.js');
const { Settings } = require('../database');

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        if (user.bot) return;

        await reaction.fetch();

        const guild = await reaction.message.guild.fetch();
        const member = await guild.members.fetch(user.id);
        const colorsMessageSettings = await Settings.findOne({ where: { name: 'colors_message_id' } });

        // Handle rules acceptance
        if (reaction.emoji.id === process.env.CHECK_EMOJI) {
            const rulesMessageSettings = await Settings.findOne({ where: { name: 'rules_message_id' } });

            if (rulesMessageSettings && rulesMessageSettings.value === reaction.message.id) {
                await member.roles.remove(await guild.roles.fetch(process.env.DEFAULT_ROLE_ID));
                return;
            }
        }

        // Handle color roles
        if (colorsMessageSettings && colorsMessageSettings.value === reaction.message.id) {
            const emojiName = reaction.emoji.name;
            const wantedRole = guild.roles.cache.find(
                role => role.name === emojiName.charAt(0).toUpperCase() + emojiName.slice(1).toLowerCase()
            );

            if (wantedRole && !member.roles.cache.get(wantedRole.id)) {
                await member.roles.add(wantedRole);
            }
        }
    },
};
