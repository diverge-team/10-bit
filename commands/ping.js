const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Une petite partie ?'),
    async execute(interaction) {
        await interaction.reply('Pong !');
    },
};
