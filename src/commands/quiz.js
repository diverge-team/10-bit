const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { generateQuiz, createQuizMessage } = require('../helpers/isaacQuiz');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quiz')
		.setDescription('[Admin] Poste un quiz Isaac dans le salon actuel')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
			return interaction.reply({
				content: '❌ Cette commande est réservée aux administrateurs.',
				ephemeral: true,
			});
		}

		try {
			const quiz = generateQuiz();
			const { embed, row } = createQuizMessage(quiz);

			await interaction.reply({ embeds: [embed], components: [row] });
		} catch (error) {
			console.error('Error in /quiz command:', error);
			await interaction.reply({
				content: '❌ Erreur lors de la génération du quiz.',
				ephemeral: true,
			});
		}
	},
};
