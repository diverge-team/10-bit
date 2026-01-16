const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { Settings } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('colors')
        .setDescription('Publie les roles colores.')
        .setDefaultMemberPermissions(0),
    async execute(interaction) {
        const colorsMessageSettings = await Settings.findOne({ where: { name: 'colors_message_id' } });
        const rolesChannel = await interaction.client.channels.fetch(process.env.ROLES_CHANNEL_ID);

        if (colorsMessageSettings) {
            const url = `https://discord.com/channels/${process.env.GUILD_ID}/${rolesChannel.id}/${colorsMessageSettings.value}`;
            await interaction.reply({ content: `Menu deja poste: ${url}`, flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.deferReply();

        const message = await rolesChannel.send({
            content: '**Roles : Couleur**\nChoisi ta couleur en selectionnant une reaction ci-dessous :',
        });

        // React with color emojis
        await message.react('1066355187272392774'); // vert
        await message.react('1066355168301555812'); // bleu
        await message.react('1066355197439397979'); // violet
        await message.react('1066355215089008640'); // rose
        await message.react('1066346234501156894'); // jaune
        await message.react('1066355230662459452'); // orange
        await message.react('1066355242670772284'); // gris

        await Settings.create({
            name: 'colors_message_id',
            value: message.id,
        });

        const url = `https://discord.com/channels/${process.env.GUILD_ID}/${process.env.ROLES_CHANNEL_ID}/${message.id}`;
        await interaction.editReply(`Roles colores publies: ${url}`);
    },
};
