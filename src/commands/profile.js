const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { Member, QuizScore } = require('../database');

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

        // Get quiz scores
        const isaacScore = await QuizScore.findOne({
            where: { user_id: interaction.user.id, game: 'isaac' },
        });

        const embed = new EmbedBuilder()
            .setTitle('Ton profil Diverge')
            .setColor(0x5865F2)
            .addFields(
                { name: 'Utilisateur', value: `<@${member.user_id}>`, inline: true },
                { name: 'Messages', value: `${member.nbMessages}`, inline: true },
                { name: 'XP', value: `${member.xp}`, inline: true },
            )
            .setTimestamp();

        // Add quiz scores section if any
        if (isaacScore && isaacScore.total_answers > 0) {
            const percentage = Math.round((isaacScore.correct_answers / isaacScore.total_answers) * 100);
            embed.addFields({
                name: '🎮 Quiz Isaac',
                value: `${isaacScore.correct_answers}/${isaacScore.total_answers} (${percentage}%)`,
                inline: true,
            });
        }

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};
