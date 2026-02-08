const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getAllNicholasInfo } = require('../helpers/nicholasScraper');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nicholas')
		.setDescription('[Admin] Affiche les informations actuelles de Nicholas (Guild Wars 1)')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		// Double check permissions
		if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
			return interaction.reply({
				content: '❌ Cette commande est réservée aux administrateurs.',
				ephemeral: true,
			});
		}

		await interaction.deferReply();

		try {
			const { traveler, sandford } = await getAllNicholasInfo();

			// Build clickable links for Traveler
			const travelerLocation = traveler.mapUrl
				? `[${traveler.location}](${traveler.mapUrl})`
				: traveler.location;
			const travelerItem = traveler.itemUrl
				? `[${traveler.item}](${traveler.itemUrl})`
				: traveler.item;

			// Embed pour Nicholas le Voyageur
			const travelerEmbed = new EmbedBuilder()
				.setTitle('🧳 Nicholas le Voyageur')
				.setColor(0x00AE86)
				.addFields(
					{ name: '📍 Localisation', value: travelerLocation, inline: true },
					{ name: '📦 Objet demandé', value: travelerItem, inline: true },
					{ name: '🔢 Quantité', value: `${traveler.quantity} par cadeau`, inline: true },
				)
				.setFooter({ text: 'Mise à jour hebdomadaire - Tous les lundis à 15:00 UTC' })
				.setTimestamp();


			// Build clickable link for Sandford item
			const sandfordItem = sandford.itemUrl
				? `[${sandford.item}](${sandford.itemUrl})`
				: sandford.item;

			// Embed pour Nicholas Sandford
			const sandfordEmbed = new EmbedBuilder()
				.setTitle('🏹 Nicholas Sandford')
				.setColor(0xFF6B35)
				.addFields(
					{ name: '📦 Objet demandé', value: sandfordItem, inline: true },
					{ name: '🔢 Quantité', value: `${sandford.quantity} objets`, inline: true },
				)
				.setFooter({ text: 'Mise à jour quotidienne - Tous les jours à 07:00 UTC' })
				.setTimestamp();


			await interaction.editReply({
				embeds: [travelerEmbed, sandfordEmbed],
			});
		} catch (error) {
			console.error('Error in /nicholas command:', error);
			await interaction.editReply({
				content: '❌ Erreur lors de la récupération des informations de Nicholas. Vérifiez les logs.',
			});
		}
	},
};
