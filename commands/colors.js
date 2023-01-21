const { SlashCommandBuilder } = require('discord.js');
const { Settings } = require('../dbObjects.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('colors')
        .setDescription('Publie les rôles colorés.')
        .setDefaultMemberPermissions(0),
    async execute(interaction) {
        let colorsMessageSettings = await Settings.findOne({where: {name: 'colors_message_id'}});
        const channelsCollection  = interaction.client.channels;
        const rolesChannel        = await channelsCollection.fetch(process.env.ROLES_CHANNEL_ID);

        if (colorsMessageSettings) {
            interaction.reply({content: 'Menu déjà posté :\r\n<https://discord.com/channels/' + process.env.GUILD_ID + '/' + rolesChannel.id + '/' + colorsMessageSettings.value + '>.', ephemeral: true});
        } else {
            await interaction.deferReply();
            const message = await rolesChannel.send({
                content: '**Rôles : Couleur**\r\nChoisi ta couleur en sélectionnant une réaction ci-dessous :',
            });

            await message.react('1066355187272392774'); // vert
            await message.react('1066355168301555812'); // bleu
            await message.react('1066355197439397979'); // violet
            await message.react('1066355215089008640'); // rose
            await message.react('1066346234501156894'); // jaune
            await message.react('1066355230662459452'); // orange
            await message.react('1066355242670772284'); // gris

            colorsMessageSettings = await Settings.create({
                name: 'colors_message_id',
                value: message.id,
            });

            await interaction.editReply('Roles colorés publiés : <https://discord.com/channels/' + process.env.GUILD_ID + '/' + process.env.ROLES_CHANNEL_ID + '/' + message.id + '>.');
        }
    }
};
