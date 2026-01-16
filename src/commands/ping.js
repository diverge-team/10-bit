const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Une petite partie ?'),
    async execute(interaction) {
        const { resource } = await interaction.reply({ content: 'Pong!', withResponse: true });
        const latency = resource.message.createdTimestamp - interaction.createdTimestamp;
        await interaction.editReply(`Pong! Latence: ${latency}ms`);
    },
};
