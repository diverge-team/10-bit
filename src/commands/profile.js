const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { Member } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Permet de voir ta progression.'),
    async execute(interaction) {
        let member = await Member.findOne({ where: { user_id: interaction.user.id } });

        if (!member) {
            member = await Member.create({
                user_id: interaction.user.id,
                nbMessages: 0,
                xp: 0,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('Ton profil Diverge')
            .setColor(0x5865F2)
            .addFields(
                { name: 'Utilisateur', value: `<@${member.user_id}>`, inline: true },
                { name: 'Messages', value: `${member.nbMessages}`, inline: true },
                { name: 'XP', value: `${member.xp}`, inline: true },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};
