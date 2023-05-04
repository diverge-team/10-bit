const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const guild = await member.guild.fetch();
        const role  = await guild.roles.fetch(process.env.DEFAULT_ROLE_ID);
        await member.roles.add(role);
    },
};
