const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Member } = require('../dbObjects.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Permet de voir ta progression.'),
    async execute(interaction) {
        let member = await Member.findOne({where: {user_id: interaction.user.id}})

        if (!member) {
            member = await Member.create({
                user_id: interaction.user.id,
                nb_messages: 0,
                xp: 0
            })
        }

        await member;

        await interaction.reply({embeds: [
            new EmbedBuilder()
                .setTitle('Ton profil Diverge')
                .setDescription(
                    'Utilisateur : <@' + member.user_id + '>\r\n' +
                    'Nombre de messages : ' + member.nb_messages + '\r\n' +
                    'Expérience : ' + member.xp + '\r\n' +
                    'Succès : Aucun'
                )
            ], ephemeral: true
        });
    }
};
